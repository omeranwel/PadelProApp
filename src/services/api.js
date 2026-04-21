const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('auth-storage') 
    ? JSON.parse(localStorage.getItem('auth-storage')).state.token 
    : null;
    
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const api = {
  get: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, { headers: getHeaders() });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Request failed');
    }
    return res.json();
  },

  post: async (endpoint, data, isMultipart = false) => {
    const headers = getHeaders();
    if (isMultipart) delete headers['Content-Type'];

    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: isMultipart ? data : JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Request failed');
    }
    return res.json();
  },

  patch: async (endpoint, data) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Request failed');
    }
    return res.json();
  },

  put: async (endpoint, data) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Request failed');
    }
    return res.json();
  },

  delete: async (endpoint) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Request failed');
    }
    return res.json();
  }
};
