import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantityChange, setQuantityChange] = useState('');

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await api.get(`/inventory/item/${id}`);
      // Parse HTML response to extract item data
      // For now, we'll simulate the data structure
      setItem({
        id: parseInt(id),
        item_name: 'Sample Item',
        category: { name: 'Electronics' },
        quantity: 50,
        unit_price: 1500.00,
        supplier: 'Tech Supplier',
        location: 'Headquarters',
        description: 'Sample description',
        creator: { name: 'Admin User' },
        created_at: new Date().toISOString(),
        updater: { name: 'Admin User' },
        updated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error fetching item:', error);
      Swal.fire('Error', 'Failed to fetch item details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/inventory/delete/${id}`);
        Swal.fire('Deleted!', 'Item has been deleted.', 'success');
        navigate('/inventory');
      } catch (error) {
        Swal.fire('Error', 'Failed to delete item', 'error');
      }
    }
  };

  const handleQuantityAdjustment = async (e) => {
    e.preventDefault();
    if (!quantityChange) return;

    try {
      await api.post(`/inventory/adjust-quantity/${id}`, {
        quantity_change: parseInt(quantityChange)
      });
      Swal.fire('Success', 'Quantity adjusted successfully', 'success');
      fetchItem();
      setQuantityChange('');
    } catch (error) {
      Swal.fire('Error', 'Failed to adjust quantity', 'error');
    }
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

  if (loading) {
    return <div className="loading">Loading item details...</div>;
  }

  if (!item) {
    return <div className="error">Item not found</div>;
  }

  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <h2>Inventory Item Details</h2>
        <div>
          {user?.is_admin && (
            <>
              <a href={`/inventory/${item.id}/edit`} className="action-link edit">Edit</a>
              <button onClick={handleDelete} className="action-link delete">Delete</button>
            </>
          )}
          <a href="/inventory" className="action-link view">Back to List</a>
        </div>
      </div>

      <div className="item-details">
        <table className="inventory-table">
          <tbody>
            <tr>
              <th>Item Name</th>
              <td>{item.item_name}</td>
            </tr>
            <tr>
              <th>Category</th>
              <td>{item.category.name}</td>
            </tr>
            <tr>
              <th>{user?.is_admin ? 'Quantity' : 'Stock Status'}</th>
              <td>
                {user?.is_admin ? (
                  <span className={`quantity-display ${getStockStatus(item.quantity)}`}>
                    {item.quantity}
                  </span>
                ) : (
                  <button className={`stock-status-btn ${getStockStatus(item.quantity)}`} disabled>
                    {getStockStatusText(item.quantity)}
                  </button>
                )}
              </td>
            </tr>
            {user?.is_admin && (
              <>
                <tr>
                  <th>Unit Price</th>
                  <td>{item.unit_price ? `₦${parseFloat(item.unit_price).toFixed(2)}` : 'N/A'}</td>
                </tr>
                <tr>
                  <th>Supplier</th>
                  <td>{item.supplier || 'N/A'}</td>
                </tr>
              </>
            )}
            <tr>
              <th>Location</th>
              <td>{item.location || 'N/A'}</td>
            </tr>
            <tr>
              <th>Description</th>
              <td>{item.description || 'N/A'}</td>
            </tr>
            {user?.is_admin && (
              <>
                <tr>
                  <th>Created By</th>
                  <td>{item.creator.name}</td>
                </tr>
                <tr>
                  <th>Created At</th>
                  <td>{new Date(item.created_at).toLocaleString()}</td>
                </tr>
                <tr>
                  <th>Last Updated By</th>
                  <td>{item.updater.name}</td>
                </tr>
                <tr>
                  <th>Last Updated At</th>
                  <td>{new Date(item.updated_at).toLocaleString()}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {user?.is_admin && (
        <div className="quantity-adjustment">
          <h3>Adjust Quantity</h3>
          <form onSubmit={handleQuantityAdjustment} className="adjustment-form">
            <div className="form-group">
              <label htmlFor="quantity_change">Quantity Change</label>
              <input
                type="number"
                id="quantity_change"
                value={quantityChange}
                onChange={(e) => setQuantityChange(e.target.value)}
                placeholder="Enter positive or negative number"
                required
              />
              <small className="help-text">
                Use positive numbers to add stock, negative to reduce
              </small>
            </div>
            <button type="submit" className="create-button">Adjust Quantity</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default InventoryDetail;