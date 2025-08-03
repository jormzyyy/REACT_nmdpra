import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Layout.css';

const Layout = ({ children }) => {
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

  return (
    <div className="layout">
      <header className="header">
        <div className="header-left">
          <img src="/images/logo/nmdpra-logo.png" alt="NMDPRA Logo" className="header-logo" />
          <h1>NMDPRA Store Management System</h1>
        </div>
        <nav className="header-nav">
          <a href="/dashboard">Dashboard</a>
          <a href="/inventory">Inventory</a>
          {user?.is_admin ? (
            <>
              <a href="/requests">All Requests</a>
              <a href="/purchases">Purchases</a>
              <a href="/reports">Reports</a>
            </>
          ) : (
            <>
              <a href="/requests/create">Create Request</a>
              <a href="/requests/my">My Requests</a>
            </>
          )}
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </nav>
      </header>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;