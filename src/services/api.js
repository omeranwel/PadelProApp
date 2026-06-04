import { auth } from '../lib/firebase';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function apiCall(endpoint, options = {}) {
  // Try to get token. Wait for auth state to be ready if needed.
  let token = null;
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken(true);
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired mid-session — sign user out and redirect to login
    await auth.signOut();
    window.location.href = '/';
    return;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    const err = new Error(error.error || error.message || `HTTP ${response.status}`);
    err.response = { data: error }; // Maintain Axios compatibility
    throw err;
  }

  return response.json();
}

export const api = {
  get: (endpoint) => apiCall(endpoint),
  post: (endpoint, data, isMultipart = false) => {
    const headers = {};
    if (isMultipart) {
      // For multipart, don't set Content-Type manually (browser sets it with boundary)
      return apiCall(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': undefined }, // Let browser handle it
        body: data
      }).then(res => {
        // Special override since fetch won't ignore undefined content type easily
      }).catch(err => { throw err; }); // Need to fix multipart
    }
    return apiCall(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },
  patch: (endpoint, data) => apiCall(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data)
  }),
  put: (endpoint, data) => apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  delete: (endpoint) => apiCall(endpoint, {
    method: 'DELETE'
  })
};

// Fix multipart post helper
api.postMultipart = async (endpoint, formData) => {
  let token = null;
  if (auth.currentUser) {
    token = await auth.currentUser.getIdToken(true);
  }
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData
  });
  if (response.status === 401) {
    await auth.signOut();
    window.location.href = '/';
    return;
  }
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    const err = new Error(error.error || error.message || `HTTP ${response.status}`);
    err.response = { data: error };
    throw err;
  }
  return response.json();
};
