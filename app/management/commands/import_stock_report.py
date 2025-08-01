import csv
import logging
from datetime import datetime
from decimal import Decimal, InvalidOperation

import click
from flask.cli import with_appcontext
from app import db
from app.models.inventory import Inventory, Category
from app.models.inventory_transaction import InventoryTransaction
from app.models.request import Request, RequestItem, DirectorateEnum, RequestStatus, ItemRequestStatus
from app.models.user import User

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def clear_existing_data(category):
    """Deletes all inventory data associated with a specific category."""
    logger.info(f"Clearing existing data for category: '{category.name}'")
    try:
        # Find all inventory items in the category
        inventory_items = Inventory.query.filter_by(category_id=category.id).all()
        if not inventory_items:
            logger.info("No existing inventory items to clear.")
            return

        inventory_ids = [item.id for item in inventory_items]

        # Find and delete related requests
        requests_to_delete = Request.query.join(RequestItem).filter(RequestItem.inventory_id.in_(inventory_ids)).all()
        for req in requests_to_delete:
            db.session.delete(req)
        logger.info(f"Deleted {len(requests_to_delete)} related request(s).")

        # Find and delete related transactions
        transactions_to_delete = InventoryTransaction.query.filter(InventoryTransaction.inventory_id.in_(inventory_ids)).all()
        for trans in transactions_to_delete:
            db.session.delete(trans)
        logger.info(f"Deleted {len(transactions_to_delete)} related transaction(s).")

        # Delete the inventory items themselves
        for item in inventory_items:
            db.session.delete(item)
        logger.info(f"Deleted {len(inventory_items)} inventory item(s).")

        db.session.commit()
        logger.info("Data clearing complete.")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Error clearing existing data: {e}")
        raise

def register(app):
    @app.cli.command('import_stock_report')
    @click.argument('filepath')
    @click.option('--clear', is_flag=True, help='Clear all existing data for the "OFFICE CONSUMABLES" category before importing.')
    @with_appcontext
    def import_stock_report(filepath, clear):
        """
        Imports stock data from a CSV file for the month of June.
        """
        try:
            # --- 1. Pre-flight checks ---
            admin_user = User.query.filter_by(is_admin=True).first()
            if not admin_user:
                logger.error("No admin user found. Please create one.")
                return

            requester_user = User.query.filter_by(is_admin=False).first()
            if not requester_user:
                logger.error("No non-admin user found to act as requester. Please create one.")
                return

            category = Category.query.filter(Category.name.ilike("OFFICE CONSUMABLES")).first()
            if not category:
                logger.error("Category 'OFFICE CONSUMABLES' not found. Please create it.")
                return

            # --- 2. Clear existing data if requested ---
            if clear:
                clear_existing_data(category)

            # --- 3. Process the CSV file ---
            with open(filepath, mode='r', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                
                with db.session.begin_nested():
                    for row_num, row in enumerate(reader, start=2):
                        try:
                            # --- Data Validation and Parsing ---
                            item_name = row.get('Item Name')
                            if not item_name or not item_name.strip():
                                logger.warning(f"Skipping row {row_num}: 'Item Name' is missing. Row data: {row}")
                                continue
                            
                            # Use the report start date for all timestamps
                            report_date_str = row.get('Report Start Date')
                            if not report_date_str:
                                logger.warning(f"Skipping row {row_num}: 'Report Start Date' is missing. Row data: {row}")
                                continue
                            
                            import_date = datetime.strptime(report_date_str, '%Y-%m-%d')

                            # Filter for June data
                            if import_date.month != 6:
                                continue

                            # --- Create Inventory Item ---
                            inventory_item = Inventory(
                                item_name=item_name.strip(),
                                description=row.get('DESCRIPTION'),
                                quantity=int(float(row.get('Closing Stock', 0))),
                                unit_price=Decimal(row.get('Unit Price', '0.0')),
                                category_id=category.id,
                                location='Headquarters',
                                created_by=admin_user.id,
                                updated_by=admin_user.id,
                                created_at=import_date,
                                updated_at=import_date
                            )
                            db.session.add(inventory_item)
                            db.session.flush()  # Flush to get the new item's ID

                            # --- Create Transactions ---
                            opening_stock = int(float(row.get('Opening Stock', 0)))
                            if opening_stock > 0:
                                db.session.add(InventoryTransaction(
                                    inventory_id=inventory_item.id, transaction_type='initial',
                                    quantity=opening_stock, performed_by=admin_user.id,
                                    timestamp=import_date, note='Initial stock from June 2025 report.'
                                ))

                            purchases = int(float(row.get('Purchases', 0)))
                            if purchases > 0:
                                db.session.add(InventoryTransaction(
                                    inventory_id=inventory_item.id, transaction_type='purchase',
                                    quantity=purchases, performed_by=admin_user.id,
                                    timestamp=import_date, note='Purchases from June 2025 report.'
                                ))

                            issued = int(float(row.get('Issued', 0)))
                            if issued > 0:
                                # Create a Request for the issued items
                                issue_request = Request(
                                    user_id=requester_user.id,
                                    location='Headquarters',
                                    directorate=DirectorateEnum.ACE,
                                    unit='ACE',
                                    status=RequestStatus.COLLECTED, # Mark as collected since it's historical
                                    created_at=import_date,
                                    updated_at=import_date,
                                    reference_number=f"REQ-IMPORT-{inventory_item.id}-{row_num}"
                                )
                                db.session.add(issue_request)
                                db.session.flush()

                                # Create the RequestItem
                                db.session.add(RequestItem(
                                    request_id=issue_request.id, inventory_id=inventory_item.id,
                                    quantity=issued, quantity_approved=issued,
                                    status=ItemRequestStatus.COLLECTED
                                ))

                                # Create the 'issue' transaction and link it to the request
                                db.session.add(InventoryTransaction(
                                    inventory_id=inventory_item.id, transaction_type='issue',
                                    quantity=-issued, performed_by=admin_user.id,
                                    timestamp=import_date, note='Issued stock from June 2025 report.',
                                    related_request_id=issue_request.id
                                ))

                        except (ValueError, TypeError, InvalidOperation) as e:
                            logger.error(f"Skipping row {row_num} due to data error: {e}. Data: {row}")
                            continue
                        except Exception as e:
                            logger.error(f"An unexpected error occurred at row {row_num}: {e}. Data: {row}")
                            db.session.rollback() # Rollback this row
                            continue
                
                db.session.commit()
                logger.info("Stock report import completed successfully.")

        except FileNotFoundError:
            logger.error(f"Error: The file at path '{filepath}' was not found.")
        except Exception as e:
            db.session.rollback()
            logger.error(f"An error occurred during the import process: {e}")