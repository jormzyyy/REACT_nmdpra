import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const RequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const response = await api.get(`/request/api/requests/${id}`);
      setRequest(response.data);
    } catch (error) {
      console.error('Error fetching request:', error);
      Swal.fire('Error', 'Failed to fetch request details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reason) => {
    try {
      await api.post(`/request/${id}/delete`, { reason });
      Swal.fire('Success', 'Request deleted successfully', 'success');
      window.history.back();
    } catch (error) {
      Swal.fire('Error', 'Failed to delete request', 'error');
    }
  };

  const showDeleteModal = () => {
    Swal.fire({
      title: 'Delete Request',
      html: `
        <textarea id="delete-reason" class="swal2-textarea" placeholder="Reason for deletion" required></textarea>
      `,
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#dc3545',
      preConfirm: () => {
        const reason = document.getElementById('delete-reason').value;
        if (!reason) {
          Swal.showValidationMessage('Please provide a reason for deletion');
          return false;
        }
        return reason;
      }
    }).then((result) => {
      if (result.isConfirmed) {
        handleDelete(result.value);
      }
    });
  };

  if (loading) {
    return <div className="loading">Loading request details...</div>;
  }

  if (!request) {
    return <div className="error">Request not found</div>;
  }

  const canDelete = user?.is_admin || 
    (request.user_id === user?.id && request.status === 'pending');

  return (
    <div className="request-container">
      <div className="nav-buttons">
        <a href={user?.is_admin ? "/requests" : "/requests/my"} className="back-button">
          ← Back to {user?.is_admin ? 'All Requests' : 'My Requests'}
        </a>
        {canDelete && (
          <button onClick={showDeleteModal} className="action-link delete">
            Delete
          </button>
        )}
      </div>

      <div className="request-header">
        <h2>Request Details</h2>
        <span className={`status-badge status-${request.status}`}>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      </div>

      <div className="request-details">
        <div className="request-detail-item">
          <div className="detail-label">Reference Number</div>
          <div className="detail-value">{request.reference_number}</div>
        </div>
        <div className="request-detail-item">
          <div className="detail-label">Requester</div>
          <div className="detail-value">
            {request.user_name}<br/>
            <small>{request.user_email}</small>
          </div>
        </div>
        <div className="request-detail-item">
          <div className="detail-label">Directorate</div>
          <div className="detail-value">{request.directorate || 'N/A'}</div>
        </div>
        <div className="request-detail-item">
          <div className="detail-label">Department</div>
          <div className="detail-value">{request.department || 'N/A'}</div>
        </div>
        <div className="request-detail-item">
          <div className="detail-label">Unit</div>
          <div className="detail-value">{request.unit}</div>
        </div>
        <div className="request-detail-item">
          <div className="detail-label">Location</div>
          <div className="detail-value">{request.location}</div>
        </div>
        <div className="request-detail-item">
          <div className="detail-label">Created At</div>
          <div className="detail-value">{new Date(request.created_at).toLocaleString()}</div>
        </div>
        <div className="request-detail-item">
          <div className="detail-label">Last Updated</div>
          <div className="detail-value">{new Date(request.updated_at).toLocaleString()}</div>
        </div>

        {request.approved_by_name && (
          <div className="request-detail-item">
            <div className="detail-label">Approved By</div>
            <div className="detail-value">
              {request.approved_by_name}<br/>
              <small>{request.approved_by_email}</small>
            </div>
          </div>
        )}
      </div>

      {request.admin_message && (
        <div className="request-detail-item" style={{marginBottom: '2rem'}}>
          <div className="detail-label">Admin Message</div>
          <div className="detail-value">{request.admin_message}</div>
        </div>
      )}

      <div className="request-items">
        <h3>Requested Items</h3>
        {request.items.map(item => (
          <div key={item.id} className="request-item">
            <div className="request-item-header">
              <h4>{item.item_name}</h4>
              <span className={`status-badge status-${item.status}`}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </span>
            </div>
            <div className="request-item-details">
              <div>
                <div className="detail-label">Quantity Requested</div>
                <div className="detail-value">{item.quantity}</div>
              </div>
              <div>
                <div className="detail-label">Quantity Approved</div>
                <div className="detail-value">
                  {item.status === 'rejected' || item.status === 'pending' ? 'N/A' : item.quantity_approved}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RequestDetail;