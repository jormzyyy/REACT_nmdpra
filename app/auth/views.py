from flask import render_template, redirect, url_for, flash, request, current_app, session
from flask_login import login_user, logout_user, login_required, current_user
from . import auth
from app.models.user import User
from app import db
from app import login_manager
from flask import jsonify
import logging

# Configure logging (for debugging; comment out or set to WARNING in production)
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@auth.route('/')
@auth.route('/login')
def login():
    """
    Redirect to React frontend for login.
    This route now only serves as a fallback redirect.
    """
    if current_user.is_authenticated:
        return redirect('http://localhost:3000/dashboard')
    
    # Redirect to React frontend login page
    return redirect('http://localhost:3000/login')

@auth.route('/api/login/local', methods=['POST'])
def api_local_login():
    """
    API endpoint for local email/password authentication.
    Used by React frontend.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        logger.info(f"API local login attempt for email: {email}")
        
        # Validate input
        if not email or not password:
            logger.warning("API local login failed: Missing email or password")
            return jsonify({'error': 'Please provide both email and password.'}), 400
        
        # Attempt local authentication
        user = User.authenticate_local_user(email, password)
        
        if user:
            logger.info(f"API local authentication successful for user: {user.email}")
            login_user(user)
            
            return jsonify({
                'success': True,
                'message': f'Welcome back, {user.name}!',
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'is_admin': user.is_admin,
                    'job_title': user.job_title,
                    'department': user.department,
                    'company_name': user.company_name,
                    'office_location': user.office_location,
                    'last_login': user.last_login.isoformat() if user.last_login else None
                }
            }), 200
        else:
            logger.warning(f"API local authentication failed for email: {email} - Invalid credentials")
            return jsonify({'error': 'Invalid email or password. Please try again.'}), 401
            
    except Exception as e:
        logger.error(f"Error during API local authentication: {e}")
        return jsonify({'error': 'Authentication failed due to server error. Please try again.'}), 500

@auth.route('/auth/callback')
def auth_callback():
    """Process the callback from Microsoft OAuth authentication and redirect to React."""
    code = request.args.get('code')
    
    if not code:
        logger.warning("Microsoft authentication failed - no authorization code received")
        # Redirect to React with error
        return redirect('http://localhost:3000/login?error=no_code')

    logger.info("Processing Microsoft OAuth callback")
    
    try:
        user = User.authenticate_microsoft_user(code)
        
        if user:
            logger.info(f"Microsoft authentication successful for user: {user.email}")
            login_user(user)
            # Redirect to React dashboard
            return redirect('http://localhost:3000/dashboard')
        else:
            logger.warning("Microsoft authentication failed - could not create or retrieve user")
            return redirect('http://localhost:3000/login?error=auth_failed')
    except Exception as e:
        logger.error(f"Microsoft authentication error: {e}")
        return redirect('http://localhost:3000/login?error=server_error')

@auth.route('/api/logout', methods=['GET', 'POST'])
@login_required
def api_logout():
    """API endpoint for user logout."""
    user_email = current_user.email if current_user.is_authenticated else 'Unknown'
    auth_method = getattr(current_user, 'auth_method', 'unknown')
    
    logger.info(f"API User logout: {user_email} (auth_method: {auth_method})")
    
    # Remove user's session
    logout_user()
    
    return jsonify({
        'success': True,
        'message': 'You have been logged out successfully.'
    }), 200

@auth.route('/logout')
@login_required
def logout():
    """Handle user logout and redirect to React."""
    user_email = current_user.email if current_user.is_authenticated else 'Unknown'
    auth_method = getattr(current_user, 'auth_method', 'unknown')
    
    logger.info(f"User logout: {user_email} (auth_method: {auth_method})")
    
    # Remove user's session
    logout_user()
    
    # Redirect to React login page
    return redirect('http://localhost:3000/login')

@auth.route('/api/auth/verify')
def verify_token():
    """API endpoint to verify authentication token for React frontend."""
    if current_user.is_authenticated:
        return jsonify({
            'success': True,
            'user': {
                'id': current_user.id,
                'name': current_user.name,
                'email': current_user.email,
                'is_admin': current_user.is_admin,
                'job_title': current_user.job_title,
                'department': current_user.department,
                'company_name': current_user.company_name,
                'office_location': current_user.office_location,
                'last_login': current_user.last_login.isoformat() if current_user.last_login else None
            }
        }), 200
    else:
        return jsonify({'error': 'Not authenticated'}), 401

@auth.route('/api/microsoft-url')
def get_microsoft_auth_url():
    """API endpoint to get Microsoft OAuth URL for React frontend."""
    try:
        client = User.get_microsoft_client()
        auth_url = client.get_authorization_request_url(
            scopes=["User.Read"],
            redirect_uri=current_app.config['MICROSOFT_REDIRECT_URI']
        )
        return jsonify({
            'success': True,
            'auth_url': auth_url
        }), 200
    except Exception as e:
        logger.error(f"Error generating Microsoft auth URL: {e}")
        return jsonify({'error': 'Microsoft login unavailable'}), 500

def redirect_to_appropriate_page():
    """Determine and redirect to the correct React dashboard based on user role."""
    if not current_user.is_authenticated:
        logger.warning("Attempted to redirect unauthenticated user")
        return redirect('http://localhost:3000/login')
    
    # Always redirect to React dashboard
    logger.info(f"Redirecting user {current_user.email} to React dashboard")
    return redirect('http://localhost:3000/dashboard')