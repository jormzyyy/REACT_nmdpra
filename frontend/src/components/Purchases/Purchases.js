import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './Purchases.css';

const Purchases = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [filters, setFilters] = useState({
    supplier_name: '',
    item_name: '',
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  useEffect(() => {
    filterPurchases();
  }, [purchases, filters]);

  const fetchPurchases = async () => {
    try {
      const response = await api.get('/purchases/', { params: filters });
      // Parse HTML response or create API endpoint
      // For now, we'll simulate the data
      setPurchases([
        {
          id: 1,
          timestamp: new Date().toISOString(),
          inventory: { item_name: 'Laptop' },
          quantity: 5,
          supplier: { supplier_name: 'Tech Supplier' },
          unit_price: 1500.00,
          user: { name: 'Admin User' }
        }
      ]);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      Swal.fire('Error', 'Failed to fetch purchases', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterPurchases = () => {
    let filtered = purchases;

    if (filters.supplier_name) {
      filtered = filtered.filter(purchase => 
        purchase.supplier?.supplier_name?.toLowerCase().includes(filters.supplier_name.toLowerCase())
      );
    }

    if (filters.item_name) {
      filtered = filtered.filter(purchase => 
        purchase.inventory.item_name.toLowerCase().includes(filters.item_name.toLowerCase())
      );
    }

    if (filters.start_date) {
      filtered = filtered.filter(purchase => 
        new Date(purchase.timestamp) >= new Date(filters.start_date)
      );
    }

    if (filters.end_date) {
      filtered = filtered.filter(purchase => 
        new Date(purchase.timestamp) <= new Date(filters.end_date + 'T23:59:59')
      );
    }

    setFilteredPurchases(filtered);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      supplier_name: '',
      item_name: '',
      start_date: '',
      end_date: ''
    });
  };

  if (!user?.is_admin) {
    return <div className="error">Access denied. Admin privileges required.</div>;
  }

  if (loading) {
    return <div className="loading">Loading purchases...</div>;
  }

  return (
    <div className="purchase-container">
      <div className="nav-buttons">
        <a href="/purchases/new" className="action-button">+ New Purchase</a>
      </div>

      <div className="purchase-header">
        <h2>Purchase History</h2>
      </div>

      <div className="purchase-filters">
        <div className="filter-form">
          <div className="filter-group">
            <label htmlFor="supplier_name">Supplier Name:</label>
            <input
              type="text"
              id="supplier_name"
              value={filters.supplier_name}
              onChange={(e) => handleFilterChange('supplier_name', e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="item_name">Item Name:</label>
            <input
              type="text"
              id="item_name"
              value={filters.item_name}
              onChange={(e) => handleFilterChange('item_name', e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="start_date">From Date:</label>
            <input
              type="date"
              id="start_date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label htmlFor="end_date">To Date:</label>
            <input
              type="date"
              id="end_date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              className="filter-input"
            />
          </div>
          <button onClick={fetchPurchases} className="filter-button">Filter</button>
          <button onClick={clearFilters} className="clear-filters-button">Clear Filters</button>
        </div>
      </div>

      <div className="purchase-items">
        {filteredPurchases.length > 0 ? (
          <div className="table-responsive">
            <table className="purchase-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Item</th>
                  <th>Quantity</th>
                  <th>Supplier</th>
                  <th>Unit Price</th>
                  <th>Recorded By</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td>{new Date(purchase.timestamp).toLocaleString()}</td>
                    <td>{purchase.inventory.item_name}</td>
                    <td>{purchase.quantity}</td>
                    <td>{purchase.supplier?.supplier_name || 'N/A'}</td>
                    <td>
                      {purchase.unit_price ? `₦${parseFloat(purchase.unit_price).toFixed(2)}` : '-'}
                    </td>
                    <td>{purchase.user?.name || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No purchases recorded yet.</p>
        )}
      </div>
    </div>
  );
};

export default Purchases;