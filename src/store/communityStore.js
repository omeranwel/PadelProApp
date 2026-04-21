import { create } from 'zustand';
import { mockPosts } from '../data/mockPosts';

export const useCommunityStore = create((set) => ({
  posts: mockPosts,
  activeTab: 'Feed', // Feed, Forums, Blogs, Newsletter
  drafts: null,
  
  setActiveTab: (tab) => set({ activeTab: tab }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
}));
