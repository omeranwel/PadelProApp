const API_URL = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  let token = null;
  try {
    const raw = localStorage.getItem('padelpro-auth');
    if (raw) token = JSON.parse(raw)?.state?.token ?? null;
  } catch {}
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
      const err = new Error(error.error || 'Request failed');
      err.response = { data: error };
      throw err;
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
      const err = new Error(error.error || 'Request failed');
      err.response = { data: error };
      throw err;
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
      const err = new Error(error.error || 'Request failed');
      err.response = { data: error };
      throw err;
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
      const err = new Error(error.error || 'Request failed');
      err.response = { data: error };
      throw err;
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
      const err = new Error(error.error || 'Request failed');
      err.response = { data: error };
      throw err;
    }
    return res.json();
  }
};
