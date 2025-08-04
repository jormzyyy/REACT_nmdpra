import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const CreateCategory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/inventory/category/create', formData);
      Swal.fire('Success', 'Category created successfully', 'success');
      navigate('/categories');
    } catch (error) {
      Swal.fire('Error', 'Failed to create category', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.is_admin) {
    return <div className="error">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Create New Category</h2>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="inventory-form">
          <div className="form-group">
            <label htmlFor="name">Category Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-group">
            <button type="submit" className="create-button" disabled={loading}>
              {loading ? 'Creating...' : 'Create Category'}
            </button>
            <a href="/categories" className="action-link view">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategory;