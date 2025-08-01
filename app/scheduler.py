from flask_apscheduler import APScheduler
from app.models.report_cache import ReportCache

# Initialize scheduler
scheduler = APScheduler()

def cleanup_expired_reports(app):
    """
    Job to clean up expired report cache entries from the database.
    This function is designed to be run within an application context.
    """
    with app.app_context():
        try:
            count = ReportCache.cleanup_expired()
            app.logger.info(f"Successfully deleted {count} expired report(s).")
        except Exception as e:
            app.logger.error(f"An error occurred during the scheduled report cleanup: {e}")

def init_scheduler(app):
    """
    Initializes the scheduler, adds the cleanup job, and starts it.
    """
    if not app.debug or app.config.get('WERKZEUG_RUN_MAIN') == 'true':
        scheduler.init_app(app)
        scheduler.start()
        
        # Schedule the job to run every 6 hours
        scheduler.add_job(
            id='cleanup_reports_job',
            func=lambda: cleanup_expired_reports(app),
            trigger='interval',
            hours=app.config.get('REPORT_CLEANUP_INTERVAL', 6)
        )
        app.logger.info("Scheduler started and 'cleanup_reports_job' has been added.")
