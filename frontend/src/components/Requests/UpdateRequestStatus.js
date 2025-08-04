import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const UpdateRequestStatus = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [itemStatuses, setItemStatuses] = useState({});
  const [approvedQuantities, setApprovedQuantities] = useState({});
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
      const requestData = response.data;
      setRequest(requestData);
      setAdminMessage(requestData.admin_message || '');
      
      // Initialize item statuses and quantities
      const statuses = {};
      const quantities = {};
      requestData.items.forEach(item => {
        statuses[item.id] = item.status;
        quantities[item.id] = item.quantity_approved || item.quantity;
      });
      setItemStatuses(statuses);
      setApprovedQuantities(quantities);
    } catch (error) {
      console.error('Error fetching request:', error);
      Swal.fire('Error', 'Failed to fetch request details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleItemStatusChange = (itemId, status) => {
    setItemStatuses({
      ...itemStatuses,
      [itemId]: status
    });
  };

  const handleQuantityChange = (itemId, quantity) => {
    setApprovedQuantities({
      ...approvedQuantities,
      [itemId]: quantity
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const result = await Swal.fire({
      title: 'Confirm Submission',
      text: 'Do you confirm this submission?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, confirm'
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);

    try {
      const updateData = {
        admin_message: adminMessage,
        item_statuses: itemStatuses,
        approved_quantities: approvedQuantities
      };

      await api.post(`/request/${id}/status`, updateData);
      Swal.fire('Success', 'Request status updated successfully', 'success');
      navigate(`/requests/${id}`);
    } catch (error) {
      Swal.fire('Error', 'Failed to update request status', 'error');
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

  return (
    <div className="request-container">
      <div className="nav-buttons">
        <a href={`/requests/${id}`} className="back-button">← Back to Request</a>
      </div>

      <div className="request-header">
        <h2>Update Request Status</h2>
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

      <div className="form-container">
        <form onSubmit={handleSubmit} className="inventory-form">
          <div className="form-group">
            <label htmlFor="admin_message">Admin Message</label>
            <textarea
              id="admin_message"
              value={adminMessage}
              onChange={(e) => setAdminMessage(e.target.value)}
              rows="4"
              placeholder="Add a message or note about this status update"
            />
          </div>

          <div className="request-items">
            <h3>Requested Items</h3>
            <table className="request-table">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity Requested</th>
                  <th>Quantity Approved</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {request.items.map(item => (
                  <tr key={item.id}>
                    <td>{item.item_name}</td>
                    <td>{item.quantity}</td>
                    <td>
                      <input
                        type="number"
                        value={approvedQuantities[item.id] || ''}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        min="0"
                        required
                        style={{width: '80px'}}
                      />
                    </td>
                    <td>
                      <select
                        value={itemStatuses[item.id] || 'approved'}
                        onChange={(e) => handleItemStatusChange(item.id, e.target.value)}
                        required
                      >
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="form-group" style={{marginTop: '2rem'}}>
            <button type="submit" className="action-button" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Request Status'}
            </button>
            <a href={`/requests/${id}`} className="action-link view">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateRequestStatus;