import { create } from 'zustand';
import { communityService } from '../services/communityService';

export const useCommunityStore = create((set) => ({
  posts: [],
  loading: false,
  error: null,
  activeTab: 'Feed', // Feed, Forums, Blogs, Newsletter
  drafts: null,
  
  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const data = await communityService.getPosts();
      set({ posts: data, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addPost: async (postData) => {
    try {
      // Typically the photo upload logic happens in the UI before sending or as FormData
      // Assuming postData is properly formatted or FormData
      const newPost = await communityService.createPost(postData);
      set((state) => ({ posts: [newPost, ...state.posts] }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },
}));
