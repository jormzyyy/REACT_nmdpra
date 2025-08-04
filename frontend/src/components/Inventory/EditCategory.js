import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/categories');
      return;
    }
    fetchCategory();
  }, [id, user, navigate]);

  const fetchCategory = async () => {
    try {
      // Simulate fetching category data
      setFormData({
        name: 'Sample Category',
        description: 'Sample description'
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      Swal.fire('Error', 'Failed to fetch category details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.post(`/inventory/category/edit/${id}`, formData);
      Swal.fire('Success', 'Category updated successfully', 'success');
      navigate('/categories');
    } catch (error) {
      Swal.fire('Error', 'Failed to update category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user?.is_admin) {
    return <div className="error">Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return <div className="loading">Loading category details...</div>;
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Edit Category</h2>
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
            <button type="submit" className="create-button" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Category'}
            </button>
            <a href="/categories" className="action-link view">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;