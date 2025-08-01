"""Add ondelete cascade to foreign keys for RequestItem 

Revision ID: 48ae8da88d6a
Revises: b483f4261e9a
Create Date: 2025-06-25 19:51:28.659791

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '48ae8da88d6a'
down_revision = 'b483f4261e9a'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('request_items', schema=None) as batch_op:
        batch_op.drop_constraint('fk_request_items_inventory_id_inventories', type_='foreignkey')
        batch_op.create_foreign_key(batch_op.f('fk_request_items_inventory_id_inventories'), 'inventories', ['inventory_id'], ['id'], ondelete='CASCADE')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('request_items', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('fk_request_items_inventory_id_inventories'), type_='foreignkey')
        batch_op.create_foreign_key('fk_request_items_inventory_id_inventories', 'inventories', ['inventory_id'], ['id'])

    # ### end Alembic commands ###
