import React, { useState, useEffect } from 'react';
import { cartAPI } from '../api';
import './Cart.css';

function Cart({ userId }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(10);

  useEffect(() => {
    loadCart();
  }, [userId]);

  const loadCart = async () => {
    try {
      const data = await cartAPI.getCart(userId);
      setCart(data);
    } catch (error) {
      console.error('Error loading cart:', error);
      const errorMsg = error.message || 'Unknown error';
      if (errorMsg.includes('API returned non-JSON')) {
        setMessage('API connection error. Please check if backend is running and REACT_APP_API_URL is set correctly.');
      } else {
        setMessage('Error loading cart: ' + errorMsg);
      }
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const prodId = productId || `product${Date.now()}`;
      await cartAPI.addItem(userId, prodId, parseInt(quantity), parseFloat(price));
      setMessage('Item added to cart!');
      setProductId('');
      setQuantity(1);
      setPrice(10);
      await loadCart();
    } catch (error) {
      setMessage(error.message || 'Error adding item to cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Cart">
      <h2>Shopping Cart</h2>
      <p className="user-id">User ID: {userId}</p>

      <form onSubmit={handleAddItem} className="add-item-form">
        <div className="form-group">
          <label>Product ID:</label>
          <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Leave empty for auto-generated"
          />
        </div>
        <div className="form-group">
          <label>Quantity:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="1"
            required
          />
        </div>
        <div className="form-group">
          <label>Price:</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            min="0.01"
            step="0.01"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add to Cart'}
        </button>
      </form>

      {message && <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>{message}</div>}

      {cart && (
        <div className="cart-details">
          <h3>Cart Items</h3>
          {cart.items && cart.items.length > 0 ? (
            <>
              <table>
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.productId}</td>
                      <td>{item.quantity}</td>
                      <td>${item.price.toFixed(2)}</td>
                      <td>${(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="cart-total">
                <strong>Total: ${cart.total.toFixed(2)}</strong>
              </div>
            </>
          ) : (
            <p>Your cart is empty</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Cart;

