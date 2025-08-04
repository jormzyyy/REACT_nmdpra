import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inventories, setInventories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    location: '',
    directorate: '',
    department: '',
    unit: ''
  });
  const [items, setItems] = useState([{
    category_id: '',
    inventory_id: '',
    quantity: ''
  }]);
  const [loading, setLoading] = useState(false);

  const directorateChoices = [
    'ACE', 'Audit', 'DSSRI', 'HPPITI', 'CS&A', 'MDGIF', 'F&A', 
    'Procurement', 'HSEC', 'ERSP', 'ICT'
  ];

  useEffect(() => {
    fetchInventories();
    fetchCategories();
  }, []);

  const fetchInventories = async () => {
    try {
      const response = await api.get('/inventory/api/items');
      setInventories(response.data);
    } catch (error) {
      console.error('Error fetching inventories:', error);
    }
  };

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

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Reset inventory selection when category changes
    if (field === 'category_id') {
      newItems[index].inventory_id = '';
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, {
      category_id: '',
      inventory_id: '',
      quantity: ''
    }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const getFilteredInventories = (categoryId) => {
    if (!categoryId) return inventories;
    return inventories.filter(item => item.category_id === parseInt(categoryId));
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity < 15) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusText = (quantity) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity < 15) return 'Low Stock';
    return 'In Stock';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        ...formData,
        items: items.filter(item => item.inventory_id && item.quantity)
      };

      await api.post('/request/create', requestData);
      Swal.fire('Success', 'Request created successfully', 'success');
      navigate('/requests/my');
    } catch (error) {
      Swal.fire('Error', 'Failed to create request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-container">
      <div className="nav-buttons">
        <a href="/requests/my" className="back-button">← Back to My Requests</a>
      </div>

      <div className="request-header">
        <h2>Create New Request</h2>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="inventory-form">
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            >
              <option value="">Select Location</option>
              <option value="Jabi">Jabi</option>
              <option value="Headquarters">Headquarters</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="directorate">Directorate <span style={{color:'red'}}>*</span></label>
            <select
              id="directorate"
              name="directorate"
              value={formData.directorate}
              onChange={handleChange}
              required
            >
              <option value="">Select Directorate</option>
              {directorateChoices.map(dir => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="department">Department (optional)</label>
            <input
              type="text"
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit <span style={{color:'red'}}>*</span></label>
            <input
              type="text"
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              required
            />
          </div>

          <div className="request-items">
            <h3>Add Items to Request</h3>
            <table className="request-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="request-item">
                    <td>
                      <select
                        value={item.category_id}
                        onChange={(e) => handleItemChange(index, 'category_id', e.target.value)}
                        className="category-select"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={item.inventory_id}
                        onChange={(e) => handleItemChange(index, 'inventory_id', e.target.value)}
                        className="item-select"
                        required
                      >
                        <option value="">Select Item</option>
                        {getFilteredInventories(item.category_id).map(inventory => (
                          <option key={inventory.id} value={inventory.id}>
                            {inventory.item_name}
                            {user?.is_admin ? (
                              ` (Stock: ${inventory.quantity})`
                            ) : (
                              ` - ${getStockStatusText(inventory.quantity)}`
                            )}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        required
                      />
                    </td>
                    <td>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="action-link delete"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={addItem} className="action-link view">
              + Add Another Item
            </button>
          </div>

          <div className="form-group">
            <button type="submit" className="action-button" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;