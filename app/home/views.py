from flask import render_template, redirect, url_for, flash, current_app, jsonify
from flask_login import login_required, current_user
from . import home

@home.route('/admin/dashboard')
@login_required
def admin_dashboard():
    """
    Redirect admin users to React dashboard.
    This route now serves as a fallback redirect.
    """
    # Check if user has admin privileges
    if not current_user.is_admin:
        # Redirect non-admin users to React dashboard
        return redirect('http://localhost:3000/dashboard')
    
    # Redirect admin users to React dashboard
    return redirect('http://localhost:3000/dashboard')

@home.route('/dashboard')
@login_required
def user_dashboard():
    """
    Redirect users to React dashboard.
    This route now serves as a fallback redirect.
    """
    return redirect('http://localhost:3000/dashboard')

@home.route('/api/dashboard/data')
@login_required
def api_dashboard_data():
    """
    API endpoint to get dashboard data for React frontend.
    """
    try:
        # You can add any dashboard-specific data here
        # For now, we'll return basic user info and stats
        
        dashboard_data = {
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
            },
            'quick_actions': []
        }
        
        # Add admin-specific data
        if current_user.is_admin:
            dashboard_data['quick_actions'] = [
                {'name': 'Manage Inventory', 'url': '/inventory'},
                {'name': 'View All Requests', 'url': '/requests'},
                {'name': 'Recently Deleted', 'url': '/requests/deleted'},
                {'name': 'Inventory Report', 'url': '/reports'},
                {'name': 'Manage Purchases', 'url': '/purchases'},
                {'name': 'Record New Purchase', 'url': '/purchases/new'}
            ]
        else:
            dashboard_data['quick_actions'] = [
                {'name': 'View Inventory', 'url': '/inventory'},
                {'name': 'Create Order', 'url': '/requests/create'},
                {'name': 'Request History', 'url': '/requests/my'}
            ]
        
        return jsonify({
            'success': True,
            'data': dashboard_data
        }), 200
        
    except Exception as e:
        current_app.logger.error(f"Error fetching dashboard data: {e}")
        return jsonify({'error': 'Failed to fetch dashboard data'}), 500