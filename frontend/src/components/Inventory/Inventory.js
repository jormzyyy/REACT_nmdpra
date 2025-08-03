import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './Inventory.css';

const Inventory = () => {
  const { user } = useAuth();
  const [inventories, setInventories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredInventories, setFilteredInventories] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventories();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterInventories();
  }, [inventories, categoryFilter, searchTerm]);

  const fetchInventories = async () => {
    try {
      const response = await api.get('/inventory/api/items');
      setInventories(response.data);
    } catch (error) {
      console.error('Error fetching inventories:', error);
      Swal.fire('Error', 'Failed to fetch inventory items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/inventory/categories');
      // Extract categories from HTML response or create API endpoint
      // For now, we'll create a simple categories list
      setCategories([
        { id: 1, name: 'Electronics' },
        { id: 2, name: 'Office Supplies' },
        { id: 3, name: 'Furniture' }
      ]);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filterInventories = () => {
    let filtered = inventories;

    if (categoryFilter) {
      filtered = filtered.filter(item => item.category_id === parseInt(categoryFilter));
    }

    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInventories(filtered);
  };

  const handleDelete = async (id) => {
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
        fetchInventories();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete item', 'error');
      }
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
    return <div className="loading">Loading inventory...</div>;
  }

  return (
    <div className="inventory-container">
      <div className="nav-buttons">
        <div className="nav-links">
          <a href="/categories" className="nav-link">Manage Categories</a>
          {user?.is_admin && (
            <>
              <a href="/inventory/create" className="nav-link">Add New Item</a>
              <a href="/inventory/bulk-create" className="create-button">Bulk Add Items</a>
            </>
          )}
        </div>
      </div>

      <div className="inventory-filters">
        <select 
          value={categoryFilter} 
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input" 
          placeholder="Search items..." 
        />
      </div>

      <div className="inventory-list">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Category</th>
              <th>{user?.is_admin ? 'Quantity' : 'Stock Status'}</th>
              {user?.is_admin && (
                <>
                  <th>Supplier</th>
                  <th>Unit Price</th>
                </>
              )}
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventories.map(item => (
              <tr key={item.id}>
                <td>{item.item_name}</td>
                <td>{item.category_name}</td>
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
                {user?.is_admin && (
                  <>
                    <td>{item.supplier || 'N/A'}</td>
                    <td>{item.unit_price ? `₦${parseFloat(item.unit_price).toFixed(2)}` : 'N/A'}</td>
                  </>
                )}
                <td>{item.location || 'N/A'}</td>
                <td>
                  <a href={`/inventory/${item.id}`} className="action-link view">View</a>
                  {user?.is_admin && (
                    <>
                      <a href={`/inventory/${item.id}/edit`} className="action-link edit">Edit</a>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="action-link delete"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Inventory;