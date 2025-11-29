import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api';
import './Admin.css';

function Admin() {
  const [apiKey, setApiKey] = useState('admin-secret-key-12345');
  const [statistics, setStatistics] = useState(null);
  const [nthOrder, setNthOrder] = useState(5);
  const [newNthOrder, setNewNthOrder] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [apiKey]);

  const loadData = async () => {
    try {
      const [stats, nth] = await Promise.all([
        adminAPI.getStatistics(apiKey),
        adminAPI.getNthOrder(apiKey),
      ]);
      setStatistics(stats);
      setNthOrder(nth.nthOrder);
    } catch (error) {
      setMessage('Error loading data. Check your API key.');
    }
  };

  const handleUpdateNthOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const value = parseInt(newNthOrder);
      await adminAPI.updateNthOrder(apiKey, value);
      setMessage('Nth order updated successfully!');
      setNewNthOrder('');
      await loadData();
    } catch (error) {
      setMessage(error.message || 'Error updating nth order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Admin">
      <h2>Admin Panel</h2>

      <div className="api-key-section">
        <label>Admin API Key:</label>
        <input
          type="text"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter admin API key"
        />
        <button onClick={loadData}>Refresh Data</button>
      </div>

      {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}

      {statistics && (
        <div className="statistics-section">
          <h3>Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Items Purchased</h4>
              <p className="stat-value">{statistics.totalItemsPurchased}</p>
            </div>
            <div className="stat-card">
              <h4>Total Purchase Amount</h4>
              <p className="stat-value">${statistics.totalPurchaseAmount.toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <h4>Total Discount Amount</h4>
              <p className="stat-value">${statistics.totalDiscountAmount.toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <h4>Discount Codes</h4>
              <p className="stat-value">{statistics.discountCodes.length}</p>
            </div>
          </div>

          <div className="discount-codes-section">
            <h4>Discount Codes</h4>
            {statistics.discountCodes.length > 0 ? (
              <div className="codes-list">
                {statistics.discountCodes.slice(0, 20).map((code, index) => (
                  <div key={index} className={`code-item ${code.status.toLowerCase()}`}>
                    <span className="code">{code.code}</span>
                    <span className="status">{code.status}</span>
                    {code.usedAt && (
                      <span className="date">Used: {new Date(code.usedAt).toLocaleString()}</span>
                    )}
                  </div>
                ))}
                {statistics.discountCodes.length > 20 && (
                  <p>... and {statistics.discountCodes.length - 20} more codes</p>
                )}
              </div>
            ) : (
              <p>No discount codes generated yet</p>
            )}
          </div>
        </div>
      )}

      <div className="nth-order-section">
        <h3>Nth Order Configuration</h3>
        <p>Current value: <strong>{nthOrder}</strong> (discount codes generated every {nthOrder} orders)</p>
        <form onSubmit={handleUpdateNthOrder}>
          <div className="form-group">
            <label>New Nth Order Value:</label>
            <input
              type="number"
              value={newNthOrder}
              onChange={(e) => setNewNthOrder(e.target.value)}
              min="1"
              placeholder="Enter new value"
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Updating...' : 'Update Nth Order'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Admin;

