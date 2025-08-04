import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const CreatePurchase = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [purchaseItems, setPurchaseItems] = useState([{
    category_id: '',
    inventory_id: '',
    quantity: '',
    supplier: '',
    unit_price: ''
  }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/purchases');
      return;
    }
    fetchItems();
    fetchCategories();
  }, [user, navigate]);

  const fetchItems = async () => {
    try {
      const response = await api.get('/inventory/api/items');
      setItems(response.data);
    } catch (error) {
      console.error('Error fetching items:', error);
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

  const handleItemChange = (index, field, value) => {
    const newItems = [...purchaseItems];
    newItems[index][field] = value;
    
    // Reset inventory selection when category changes
    if (field === 'category_id') {
      newItems[index].inventory_id = '';
    }
    
    setPurchaseItems(newItems);
  };

  const addItem = () => {
    setPurchaseItems([...purchaseItems, {
      category_id: '',
      inventory_id: '',
      quantity: '',
      supplier: '',
      unit_price: ''
    }]);
  };

  const removeItem = (index) => {
    if (purchaseItems.length > 1) {
      setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
    }
  };

  const getFilteredItems = (categoryId) => {
    if (!categoryId) return items;
    return items.filter(item => item.category_id === parseInt(categoryId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const purchaseData = {
        items: purchaseItems.filter(item => item.inventory_id && item.quantity)
      };

      await api.post('/purchases/new', purchaseData);
      Swal.fire('Success', 'Purchase recorded successfully', 'success');
      navigate('/purchases');
    } catch (error) {
      Swal.fire('Error', 'Failed to record purchase', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user?.is_admin) {
    return <div className="error">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="purchase-container">
      <div className="nav-buttons">
        <a href="/purchases" className="back-button">← Back to Purchases</a>
      </div>

      <div className="purchase-header">
        <h2>Record New Purchase</h2>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="inventory-form">
          <div className="purchase-items">
            <h3>Add Items to Purchase</h3>
            <table className="purchase-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Supplier</th>
                  <th>Unit Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseItems.map((item, index) => (
                  <tr key={index} className="purchase-item">
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
                        {getFilteredItems(item.category_id).map(inventoryItem => (
                          <option key={inventoryItem.id} value={inventoryItem.id}>
                            {inventoryItem.item_name} (Stock: {inventoryItem.quantity})
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
                      <input
                        type="text"
                        value={item.supplier}
                        onChange={(e) => handleItemChange(index, 'supplier', e.target.value)}
                        className="form-control"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        className="form-control"
                        min="0"
                        step="0.01"
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
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
              <button type="button" onClick={addItem} className="action-link view">
                + Add Another Item
              </button>
              <button type="submit" className="action-button" disabled={loading}>
                {loading ? 'Recording...' : 'Record Purchase'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchase;