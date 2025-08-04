import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const DeletedRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.is_admin) {
      return;
    }
    fetchDeletedRequests();
  }, [user]);

  const fetchDeletedRequests = async () => {
    try {
      // Simulate API call - you'll need to create this endpoint
      setRequests([]);
    } catch (error) {
      console.error('Error fetching deleted requests:', error);
      Swal.fire('Error', 'Failed to fetch deleted requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.post(`/request/${id}/restore`);
      Swal.fire('Success', 'Request restored successfully', 'success');
      fetchDeletedRequests();
    } catch (error) {
      Swal.fire('Error', 'Failed to restore request', 'error');
    }
  };

  const handlePermanentDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Permanently Delete?',
      text: 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete permanently'
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/request/${id}/permanent-delete`);
        Swal.fire('Deleted!', 'Request permanently deleted.', 'success');
        fetchDeletedRequests();
      } catch (error) {
        Swal.fire('Error', 'Failed to permanently delete request', 'error');
      }
    }
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: 'Delete All?',
      text: 'Are you sure you want to permanently delete ALL deleted requests? This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete all'
    });

    if (result.isConfirmed) {
      try {
        await api.post('/request/deleted/delete-all');
        Swal.fire('Success', 'All deleted requests permanently removed.', 'success');
        fetchDeletedRequests();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete all requests', 'error');
      }
    }
  };

  if (!user?.is_admin) {
    return <div className="error">Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return <div className="loading">Loading deleted requests...</div>;
  }

  return (
    <div className="request-container">
      <div className="nav-buttons">
        <a href="/requests" className="back-button">← Back to All Requests</a>
        {requests.length > 0 && (
          <button onClick={handleDeleteAll} className="action-link delete">
            Delete All
          </button>
        )}
      </div>

      <div className="request-header">
        <h2>Recently Deleted Requests</h2>
      </div>

      <div className="request-list">
        {requests.length > 0 ? (
          <table className="request-table">
            <thead>
              <tr>
                <th>Reference Number</th>
                <th>Requester</th>
                <th>Deleted By</th>
                <th>Reason</th>
                <th>Deleted At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(request => (
                <tr key={request.id}>
                  <td>{request.reference_number}</td>
                  <td>
                    {request.user_name}<br/>
                    <small>{request.user_email}</small>
                  </td>
                  <td>
                    {request.deleted_by_name || 'N/A'}<br/>
                    <small>{request.deleted_by_email || ''}</small>
                  </td>
                  <td>{request.deletion_reason || 'N/A'}</td>
                  <td>{request.deleted_at ? new Date(request.deleted_at).toLocaleString() : ''}</td>
                  <td>
                    <button 
                      onClick={() => handleRestore(request.id)}
                      className="action-link view"
                      style={{marginRight: '10px'}}
                    >
                      Restore
                    </button>
                    <button 
                      onClick={() => handlePermanentDelete(request.id)}
                      className="action-link delete"
                    >
                      Delete Permanently
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No deleted requests found.</p>
        )}
      </div>
    </div>
  );
};

export default DeletedRequests;