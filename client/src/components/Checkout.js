import React, { useState, useEffect } from 'react';
import { checkoutAPI, discountAPI } from '../api';
import './Checkout.css';

function Checkout({ userId }) {
  const [discountCode, setDiscountCode] = useState('');
  const [availableCode, setAvailableCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCode, setLoadingCode] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAvailableCode();
  }, []);

  const loadAvailableCode = async () => {
    setLoadingCode(true);
    try {
      const data = await discountAPI.getAvailable();
      if (data.code) {
        setAvailableCode(data.code);
      }
    } catch (error) {
      console.error('Error loading discount code:', error);
    } finally {
      setLoadingCode(false);
    }
  };

  const handleUseAvailableCode = () => {
    if (availableCode) {
      setDiscountCode(availableCode);
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const result = await checkoutAPI.checkout(userId, discountCode || null);
      setOrder(result.order);
      setDiscountCode('');
      if (discountCode === availableCode) {
        setAvailableCode(null);
      }
      await loadAvailableCode();
    } catch (error) {
      setError(error.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Checkout">
      <h2>Checkout</h2>
      <p className="user-id">User ID: {userId}</p>

      {availableCode && (
        <div className="available-discount">
          <h3>🎉 Available Discount Code!</h3>
          <div className="discount-code-display">
            <span className="code">{availableCode}</span>
            <button onClick={handleUseAvailableCode} className="use-code-btn">
              Use This Code
            </button>
          </div>
          <p className="discount-info">10% off your entire order!</p>
        </div>
      )}

      {!availableCode && !loadingCode && (
        <div className="no-discount">
          <p>No discount code available at the moment. Check back later!</p>
          <button onClick={loadAvailableCode} className="refresh-btn">
            Refresh
          </button>
        </div>
      )}

      <form onSubmit={handleCheckout} className="checkout-form">
        <div className="form-group">
          <label>Discount Code (Optional):</label>
          <input
            type="text"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            placeholder="Enter discount code"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {order && (
        <div className="order-success">
          <h3>Order Placed Successfully!</h3>
          <div className="order-details">
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Items:</strong> {order.items.length}</p>
            <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
            {order.discountCode && (
              <>
                <p><strong>Discount Code:</strong> {order.discountCode}</p>
                <p><strong>Discount Amount:</strong> ${order.discountAmount.toFixed(2)}</p>
              </>
            )}
            <p><strong>Final Amount:</strong> ${order.finalAmount.toFixed(2)}</p>
            <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Checkout;

