import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/inventory/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Swal.fire('Error', 'Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
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
        await api.post(`/inventory/category/delete/${id}`);
        Swal.fire('Deleted!', 'Category has been deleted.', 'success');
        fetchCategories();
      } catch (error) {
        Swal.fire('Error', 'Failed to delete category', 'error');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  return (
    <div className="inventory-container">
      <div className="nav-buttons">
        <a href="/inventory" className="back-button">← Back to Inventory</a>
      </div>
      
      <div className="inventory-header">
        <h2>Categories Management</h2>
        {user?.is_admin && (
          <a href="/categories/create" className="create-button">Add New Category</a>
        )}
      </div>

      <div className="inventory-list">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Items Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map(category => (
              <tr key={category.id}>
                <td>{category.name}</td>
                <td>{category.description || 'N/A'}</td>
                <td>{category.items_count || 0}</td>
                <td>
                  {user?.is_admin && (
                    <>
                      <a href={`/categories/${category.id}/edit`} className="action-link edit">Edit</a>
                      <button 
                        onClick={() => handleDelete(category.id)}
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

export default Categories;