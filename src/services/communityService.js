import { api } from './api';

export const communityService = {
  getPosts: async (tab = 'feed') => {
    return await api.get(`/posts?tab=${tab}`);
  },

  createPost: async (postData) => {
    const formData = new FormData();
    Object.keys(postData).forEach(key => {
      if (key === 'cover') {
        if (postData.cover) formData.append('cover', postData.cover);
      } else {
        formData.append(key, postData[key]);
      }
    });
    return await api.post('/posts', formData, true);
  },

  toggleLike: async (id, action = 'like') => {
    return await api.post(`/posts/${id}/like`, { action });
  },

  getReplies: async (id) => {
    return await api.get(`/posts/${id}/replies`);
  },

  createReply: async (id, content) => {
    return await api.post(`/posts/${id}/replies`, { content });
  }
};
