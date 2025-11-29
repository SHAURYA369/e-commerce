const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const cartAPI = {
  addItem: async (userId, productId, quantity, price) => {
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId, quantity, price }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add item');
    }
    return response.json();
  },

  getCart: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch cart');
    }
    return response.json();
  },
};

export const checkoutAPI = {
  checkout: async (userId, discountCode = null) => {
    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, discountCode }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Checkout failed');
    }
    return response.json();
  },
};

export const discountAPI = {
  getAvailable: async () => {
    const response = await fetch(`${API_BASE_URL}/discount/available`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch discount code');
    }
    return response.json();
  },
};

export const adminAPI = {
  getStatistics: async (apiKey) => {
    const response = await fetch(`${API_BASE_URL}/admin/statistics`, {
      headers: { 'x-api-key': apiKey },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch statistics');
    }
    return response.json();
  },

  getNthOrder: async (apiKey) => {
    const response = await fetch(`${API_BASE_URL}/admin/nth-order`, {
      headers: { 'x-api-key': apiKey },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch nth order');
    }
    return response.json();
  },

  updateNthOrder: async (apiKey, nthOrder) => {
    const response = await fetch(`${API_BASE_URL}/admin/nth-order`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ nthOrder }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update nth order');
    }
    return response.json();
  },

  generateDiscountCode: async (apiKey) => {
    const response = await fetch(`${API_BASE_URL}/admin/discount/generate`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate discount code');
    }
    return response.json();
  },
};

