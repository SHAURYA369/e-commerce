const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`API returned non-JSON response. Check if API URL is correct. URL: ${response.url}`);
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }
  
  return response.json();
}

export const cartAPI = {
  addItem: async (userId, productId, quantity, price) => {
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, productId, quantity, price }),
    });
    return handleResponse(response);
  },

  getCart: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/cart?userId=${userId}`);
    return handleResponse(response);
  },
};

export const checkoutAPI = {
  checkout: async (userId, discountCode = null) => {
    const response = await fetch(`${API_BASE_URL}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, discountCode }),
    });
    return handleResponse(response);
  },
};

export const discountAPI = {
  getAvailable: async () => {
    const response = await fetch(`${API_BASE_URL}/discount/available`);
    return handleResponse(response);
  },
};

export const adminAPI = {
  getStatistics: async (apiKey) => {
    const response = await fetch(`${API_BASE_URL}/admin/statistics`, {
      headers: { 'x-api-key': apiKey },
    });
    return handleResponse(response);
  },

  getNthOrder: async (apiKey) => {
    const response = await fetch(`${API_BASE_URL}/admin/nth-order`, {
      headers: { 'x-api-key': apiKey },
    });
    return handleResponse(response);
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
    return handleResponse(response);
  },

  generateDiscountCode: async (apiKey) => {
    const response = await fetch(`${API_BASE_URL}/admin/discount/generate`, {
      method: 'POST',
      headers: { 'x-api-key': apiKey },
    });
    return handleResponse(response);
  },
};

