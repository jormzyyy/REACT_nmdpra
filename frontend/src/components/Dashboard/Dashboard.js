import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Are you sure you want to log out?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#c62828',
      confirmButtonText: 'Yes, log me out',
      cancelButtonText: 'Cancel',
    });

    if (result.isConfirmed) {
      await logout();
      navigate('/login');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard-page">
      <header className="header">
        <div className="header-left">
          <img src="/images/logo/nmdpra-logo.png" alt="NMDPRA Logo" className="header-logo" />
        </div>
        <nav className="header-nav">
          <a href="#home">Home</a>
          <a href="#contact">Contact</a>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </nav>
      </header>
      
      <main className="main-content">
        <div className="dashboard-container">
          <div className="welcome-section">
            <h2>Hi, {user.name} {user.is_admin ? '(Admin)' : ''}</h2>
            <p>Last login: {new Date(user.last_login).toLocaleString()}</p>
          </div>
          
          <div className="user-profile-section">
            <h3>Your Profile Information</h3>
            <div className="profile-details">
              <div className="profile-item">
                <strong>Email:</strong> {user.email}
              </div>
              <div className="profile-item">
                <strong>Job Title:</strong> {user.job_title || 'Not specified'}
              </div>
              <div className="profile-item">
                <strong>Department:</strong> {user.department || 'Not specified'}
              </div>
              {!user.is_admin && (
                <>
                  <div className="profile-item">
                    <strong>Company:</strong> {user.company_name || 'Not specified'}
                  </div>
                  <div className="profile-item">
                    <strong>Office Location:</strong> {user.office_location || 'Not specified'}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <a href="#inventory" className="action-button">
                {user.is_admin ? 'Manage Inventory' : 'View Inventory'}
              </a>
              {user.is_admin ? (
                <>
                  <a href="#requests" className="action-button">
                    View All Requests
                  </a>
                  <a href="#deleted" className="action-button" style={{background: '#dc3545'}}>
                    Recently Deleted
                  </a>
                  <a href="#reports" className="action-button">
                    Inventory Report
                  </a>
                </>
              ) : (
                <>
                  <a href="#create-request" className="action-button">
                    Create Order
                  </a>
                  <a href="#my-requests" className="action-button">
                    Request History
                  </a>
                </>
              )}
            </div>
          </div>

          {user.is_admin && (
            <div className="quick-actions">
              <h3>Purchases</h3>
              <div className="action-buttons">
                <a href="#purchases" className="action-button">
                  Manage Purchases
                </a>
                <a href="#new-purchase" className="action-button">
                  Record New Purchase
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;