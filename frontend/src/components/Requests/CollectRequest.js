import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const CollectRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/requests');
      return;
    }
    fetchRequest();
  }, [id, user, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await Swal.fire({
      title: 'Confirm Collection',
      text: 'Are you sure you want to mark this request as collected? This will update inventory quantities.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Confirm Collection'
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);

    try {
      await api.post(`/request/${id}/collect`, { admin_note: adminNote });
      Swal.fire('Success', 'Request marked as collected successfully', 'success');
      navigate(`/requests/${id}`);
    } catch (error) {
      Swal.fire('Error', 'Failed to mark request as collected', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.is_admin) {
    return <div className="error">Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return <div className="loading">Loading request details...</div>;
  }

  if (!request) {
    return <div className="error">Request not found</div>;
  }

  const approvedItems = request.items.filter(item => item.status === 'approved');

  return (
    <div className="request-container">
      <div className="nav-buttons">
        <a href="/requests" className="back-button">← Back to Request</a>
      </div>

      <div className="request-header">
        <h2>Mark Request as Collected</h2>
        <span className={`status-badge status-${request.status}`}>
          Current: {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
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
          <div className="detail-label">Location</div>
          <div className="detail-value">{request.location}</div>
        </div>
      </div>

      <div className="request-items">
        <h3>Items to be Collected</h3>
        {approvedItems.map(item => (
          <div key={item.id} className="request-item">
            <div className="request-item-header">
              <h4>{item.item_name}</h4>
              <div className="item-status">
                <span className="status-badge status-approved">Will be Collected</span>
              </div>
            </div>
            <div className="request-item-details">
              <div>
                <div className="detail-label">Quantity Approved</div>
                <div className="detail-value">{item.quantity_approved}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="inventory-form">
          <div className="form-group">
            <label htmlFor="admin_note">Collection Note</label>
            <textarea
              id="admin_note"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows="4"
              placeholder="Add any notes about the collection (optional)"
            />
          </div>

          <div className="form-group" style={{marginTop: '2rem'}}>
            <button type="submit" className="action-button" disabled={submitting}>
              {submitting ? 'Processing...' : 'Confirm Collection'}
            </button>
            <a href={`/requests/${id}`} className="action-link view">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectRequest;