import { api } from './api';

export const marketService = {
  getListings: async (filters = {}) => {
    const params = new URLSearchParams(filters).toString();
    return await api.get(`/listings?${params}`);
  },

  getListingById: async (id) => {
    return await api.get(`/listings/${id}`);
  },

  getSavedListings: async () => {
    return await api.get('/listings/saved');
  },

  createListing: async (listingData) => {
    // Handle FormData for images
    const formData = new FormData();
    Object.keys(listingData).forEach(key => {
      if (key === 'images') {
        listingData.images.forEach(img => formData.append('images', img));
      } else {
        formData.append(key, listingData[key]);
      }
    });
    return await api.post('/listings', formData, true);
  },

  toggleSave: async (id) => {
    return await api.post(`/listings/${id}/save`);
  },

  sendOffer: async (id, offerData) => {
    return await api.post(`/listings/${id}/offer`, offerData);
  },

  incrementView: async (id) => {
    return await api.post(`/listings/${id}/view`);
  }
};
