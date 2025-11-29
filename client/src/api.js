const API_BASE_URL = 'http://localhost:3000/api';

export const cartAPI = {
  addItem: async (userId, productId, quantity, price) => {
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId, quantity, price }),
    });
    return response.json();
  },

  getCart: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}`);
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
    return response.json();
  },
};

export const adminAPI = {
  getStatistics: async (apiKey) => {
    const response = await fetch(`${API_BASE_URL}/admin/statistics`, {
      headers: { 'x-api-key': apiKey },
    });
    return response.json();
  },

  getNthOrder: async (apiKey) => {
    const response = await fetch(`${API_BASE_URL}/admin/nth-order`, {
      headers: { 'x-api-key': apiKey },
    });
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
    return response.json();
  },
};

