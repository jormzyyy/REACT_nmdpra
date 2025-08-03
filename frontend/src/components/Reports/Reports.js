import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import Swal from 'sweetalert2';
import './Reports.css';

const Reports = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState(null);

  const generateReport = async (reportType, formData) => {
    setLoading(true);
    try {
      const response = await api.post('/admin/reports/inventory', {
        report_type: reportType,
        ...formData
      });
      
      // Handle the response based on your backend implementation
      if (response.data.success) {
        setReportData(response.data.data);
        setReportId(response.data.report_id);
        Swal.fire('Success', 'Report generated successfully', 'success');
      } else {
        Swal.fire('Error', response.data.error || 'Failed to generate report', 'error');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      Swal.fire('Error', 'Failed to generate report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthlyReport = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Generate Monthly Report',
      html: `
        <div class="swal-form">
          <label>Month:</label>
          <input type="month" id="month" class="swal2-input" required>
          
          <label>Category (optional):</label>
          <select id="category" class="swal2-select">
            <option value="">All Categories</option>
            <option value="1">Electronics</option>
            <option value="2">Office Supplies</option>
          </select>
          
          <label>Location (optional):</label>
          <select id="location" class="swal2-select">
            <option value="">All Locations</option>
            <option value="Headquarters">Headquarters</option>
            <option value="Jabi">Jabi</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          month: document.getElementById('month').value,
          category_id: document.getElementById('category').value,
          location: document.getElementById('location').value
        };
      }
    });

    if (formValues && formValues.month) {
      generateReport('monthly', formValues);
    }
  };

  const handleWeeklyReport = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Generate Weekly Report',
      html: `
        <div class="swal-form">
          <label>Start Date:</label>
          <input type="date" id="start_date" class="swal2-input" required>
          
          <label>End Date:</label>
          <input type="date" id="end_date" class="swal2-input" required>
          
          <label>Category (optional):</label>
          <select id="category" class="swal2-select">
            <option value="">All Categories</option>
            <option value="1">Electronics</option>
            <option value="2">Office Supplies</option>
          </select>
          
          <label>Location (optional):</label>
          <select id="location" class="swal2-select">
            <option value="">All Locations</option>
            <option value="Headquarters">Headquarters</option>
            <option value="Jabi">Jabi</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const startDate = document.getElementById('start_date').value;
        const endDate = document.getElementById('end_date').value;
        return {
          week_range: `${startDate} to ${endDate}`,
          category_id: document.getElementById('category').value,
          location: document.getElementById('location').value
        };
      }
    });

    if (formValues && formValues.week_range) {
      generateReport('weekly', formValues);
    }
  };

  const handleDailyReport = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Generate Daily Report',
      html: `
        <div class="swal-form">
          <label>Date:</label>
          <input type="date" id="day_date" class="swal2-input" required>
          
          <label>Category (optional):</label>
          <select id="category" class="swal2-select">
            <option value="">All Categories</option>
            <option value="1">Electronics</option>
            <option value="2">Office Supplies</option>
          </select>
          
          <label>Location (optional):</label>
          <select id="location" class="swal2-select">
            <option value="">All Locations</option>
            <option value="Headquarters">Headquarters</option>
            <option value="Jabi">Jabi</option>
          </select>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        return {
          day_date: document.getElementById('day_date').value,
          category_id: document.getElementById('category').value,
          location: document.getElementById('location').value
        };
      }
    });

    if (formValues && formValues.day_date) {
      generateReport('daily', formValues);
    }
  };

  const downloadExcel = () => {
    if (reportId) {
      window.open(`/admin/reports/inventory/download/excel/${reportId}`, '_blank');
    }
  };

  if (!user?.is_admin) {
    return <div className="error">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="report-container">
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <img src="/images/logo/nmdpra-logo.png" alt="NMDPRA Logo" style={{ maxHeight: '80px' }} />
      </div>

      <h2 style={{ textAlign: 'center' }}>Inventory Report</h2>

      <div className="report-buttons" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          onClick={handleMonthlyReport} 
          className="action-button"
          disabled={loading}
        >
          Monthly Report
        </button>
        <button 
          onClick={handleWeeklyReport} 
          className="action-button"
          disabled={loading}
        >
          Weekly Report
        </button>
        <button 
          onClick={handleDailyReport} 
          className="action-button"
          disabled={loading}
        >
          Daily Report
        </button>
        
        {reportData && reportId && (
          <button 
            onClick={downloadExcel} 
            className="action-button"
            style={{ backgroundColor: '#28a745', marginLeft: 'auto' }}
          >
            Download Excel
          </button>
        )}
      </div>

      {loading && (
        <div className="loading">Generating report...</div>
      )}

      {reportData && (
        <div className="report-data">
          <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
            <strong>Period:</strong> {reportData.meta?.start_date} to {reportData.meta?.end_date}<br/>
            <strong>Generated by:</strong> {reportData.meta?.generated_by}<br/>
            <strong>Generated at:</strong> {reportData.meta?.generated_at}
          </div>

          {Object.entries(reportData.report_data || {}).map(([category, items]) => (
            <div key={category}>
              <h3 style={{ marginTop: '2rem', fontWeight: 'bold' }}>{category}</h3>
              <div className="inventory-list">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Description</th>
                      <th>Opening Stock</th>
                      <th>Purchases</th>
                      <th>Adjustment</th>
                      <th>HQ Issue</th>
                      <th>Jabi Issue</th>
                      <th>Closing Stock</th>
                      <th>Unit Price (₦)</th>
                      <th>Total Value (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row, index) => (
                      <tr key={index}>
                        <td>{row.item_name}</td>
                        <td>{row.description || 'N/A'}</td>
                        <td>{row.opening_stock}</td>
                        <td>{row.purchases}</td>
                        <td>{row.adjustments}</td>
                        <td>{row.hq_issues}</td>
                        <td>{row.jabi_issues}</td>
                        <td>{row.closing_stock}</td>
                        <td>{parseFloat(row.unit_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td>{parseFloat(row.total_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold', backgroundColor: '#f8f9fa' }}>
                      <td colSpan="2">Total for {category}</td>
                      <td>{reportData.category_totals?.[category]?.opening_stock}</td>
                      <td>{reportData.category_totals?.[category]?.purchases}</td>
                      <td>{reportData.category_totals?.[category]?.adjustments}</td>
                      <td>{reportData.category_totals?.[category]?.hq_issues}</td>
                      <td>{reportData.category_totals?.[category]?.jabi_issues}</td>
                      <td>{reportData.category_totals?.[category]?.closing_stock}</td>
                      <td></td>
                      <td>{parseFloat(reportData.category_totals?.[category]?.total_value || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          {reportData.grand_totals && (
            <div className="inventory-list" style={{ marginTop: '2rem' }}>
              <table className="inventory-table">
                <thead>
                  <tr style={{ background: '#e0e0e0' }}>
                    <th colSpan="2">Grand Total</th>
                    <th>Opening Stock</th>
                    <th>Purchases</th>
                    <th>Adjustment</th>
                    <th>HQ Issue</th>
                    <th>Jabi Issue</th>
                    <th>Closing Stock</th>
                    <th></th>
                    <th>Total Value (₦)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ fontWeight: 'bold' }}>
                    <td colSpan="2"></td>
                    <td>{reportData.grand_totals.opening_stock}</td>
                    <td>{reportData.grand_totals.purchases}</td>
                    <td>{reportData.grand_totals.adjustments}</td>
                    <td>{reportData.grand_totals.hq_issues}</td>
                    <td>{reportData.grand_totals.jabi_issues}</td>
                    <td>{reportData.grand_totals.closing_stock}</td>
                    <td></td>
                    <td>{parseFloat(reportData.grand_totals.total_value).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!reportData && !loading && (
        <div className="info-message" style={{ marginTop: '2rem', textAlign: 'center', color: '#888' }}>
          No report data available. Please select a date range and filters, then generate the report.
        </div>
      )}
    </div>
  );
};

export default Reports;