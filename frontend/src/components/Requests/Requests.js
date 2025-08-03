import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './Requests.css';

const Requests = ({ userOnly = false }) => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [userOnly]);

  useEffect(() => {
    filterRequests();
  }, [requests, statusFilter, locationFilter, searchTerm]);

  const fetchRequests = async () => {
    try {
      const endpoint = userOnly ? '/request/my-requests' : '/request/all';
      const response = await api.get(endpoint);
      // Parse HTML response or create API endpoint
      // For now, we'll simulate the data
      setRequests([
        {
          id: 1,
          reference_number: 'REQ-12345',
          user: { name: 'John Doe', email: 'john@example.com' },
          directorate: { value: 'ACE' },
          status: { value: 'pending' },
          location: 'Headquarters',
          created_at: new Date().toISOString(),
          items: []
        }
      ]);
    } catch (error) {
      console.error('Error fetching requests:', error);
      Swal.fire('Error', 'Failed to fetch requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = requests;

    if (statusFilter) {
      filtered = filtered.filter(req => req.status.value === statusFilter);
    }

    if (locationFilter) {
      filtered = filtered.filter(req => req.location === locationFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleDelete = async (id, reason) => {
    try {
      await api.post(`/request/${id}/delete`, { reason });
      Swal.fire('Success', 'Request deleted successfully', 'success');
      fetchRequests();
    } catch (error) {
      Swal.fire('Error', 'Failed to delete request', 'error');
    }
  };

  const showDeleteModal = (requestId) => {
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
        handleDelete(requestId, result.value);
      }
    });
  };

  if (loading) {
    return <div className="loading">Loading requests...</div>;
  }

  return (
    <div className="request-container">
      <div className="nav-buttons">
        {userOnly ? (
          <a href="/requests/create" className="action-button">Create New Request</a>
        ) : (
          user?.is_admin && <a href="/requests/deleted" className="action-button">Recently Deleted</a>
        )}
      </div>

      <div className="request-header">
        <h2>{userOnly ? 'My Requests' : 'All Requests'}</h2>
      </div>

      <div className="request-filters">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="partially_approved">Partially Approved</option>
          <option value="rejected">Rejected</option>
          <option value="collected">Collected</option>
        </select>

        {!userOnly && (
          <>
            <select 
              value={locationFilter} 
              onChange={(e) => setLocationFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Locations</option>
              <option value="Jabi">Jabi</option>
              <option value="Headquarters">Headquarters</option>
            </select>

            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input" 
              placeholder="Search by reference or user..." 
            />
          </>
        )}
      </div>

      <div className="request-list">
        <table className="request-table">
          <thead>
            <tr>
              <th>Reference Number</th>
              {!userOnly && (
                <>
                  <th>Requester</th>
                  <th>Directorate</th>
                </>
              )}
              <th>Status</th>
              <th>Location</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(request => (
              <tr key={request.id}>
                <td>{request.reference_number}</td>
                {!userOnly && (
                  <>
                    <td>
                      {request.user.name}<br/>
                      <small>{request.user.email}</small>
                    </td>
                    <td>{request.directorate?.value || 'N/A'}</td>
                  </>
                )}
                <td>
                  <span className={`status-badge status-${request.status.value}`}>
                    {request.status.value.charAt(0).toUpperCase() + request.status.value.slice(1)}
                  </span>
                </td>
                <td>{request.location}</td>
                <td>{new Date(request.created_at).toLocaleString()}</td>
                <td>
                  <div className="actions-container">
                    <a href={`/requests/${request.id}`} className="action-link view">View</a>
                    
                    {!userOnly && user?.is_admin && (
                      <>
                        {request.status.value === 'pending' && (
                          <a href={`/requests/${request.id}/status`} className="action-link edit">Update</a>
                        )}
                        {(request.status.value === 'approved' || request.status.value === 'partially_approved') && (
                          <a href={`/requests/${request.id}/collect`} className="action-link view">Collect</a>
                        )}
                        {request.status.value !== 'collected' && (
                          <button 
                            onClick={() => showDeleteModal(request.id)}
                            className="action-link delete"
                          >
                            Delete
                          </button>
                        )}
                      </>
                    )}

                    {userOnly && request.status.value === 'pending' && (
                      <button 
                        onClick={() => showDeleteModal(request.id)}
                        className="action-link delete"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Requests;