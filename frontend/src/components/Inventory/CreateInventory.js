import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const CreateInventory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    item_name: '',
    category_id: '',
    quantity: '',
    description: '',
    unit_price: '',
    location: 'Headquarters',
    supplier: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/inventory');
      return;
    }
    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/inventory/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
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
    setLoading(true);

    try {
      await api.post('/inventory/create', formData);
      Swal.fire('Success', 'Inventory item created successfully', 'success');
      navigate('/inventory');
    } catch (error) {
      Swal.fire('Error', 'Failed to create inventory item', 'error');
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
        <h2>Create New Inventory Item</h2>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="inventory-form">
          <div className="form-group">
            <label htmlFor="item_name">Item Name</label>
            <input
              type="text"
              id="item_name"
              name="item_name"
              value={formData.item_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category_id">Category</label>
            <select
              id="category_id"
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="supplier">Supplier</label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit_price">Unit Price (₦)</label>
            <input
              type="number"
              id="unit_price"
              name="unit_price"
              value={formData.unit_price}
              onChange={handleChange}
              step="0.01"
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            >
              <option value="Headquarters">Headquarters</option>
            </select>
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
              {loading ? 'Creating...' : 'Create Item'}
            </button>
            <a href="/inventory" className="action-link view">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInventory;