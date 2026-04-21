import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockProducts } from '../data/mockProducts';

export const useMarketStore = create(
  persist(
    (set) => ({
      listings: mockProducts,
      filters: {
        category: 'All',
        priceMax: 50000,
        conditions: [],
        ratingMin: 0,
        sort: 'Newest'
      },
      myListings: [],
      draftListing: null,
      savedItems: [],
      
      setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      saveDraft: (draft) => set({ draftListing: draft }),
      publishListing: (listing) => set((state) => ({ 
        listings: [listing, ...state.listings],
        myListings: [listing, ...state.myListings],
        draftListing: null
      })),
      toggleSave: (productId) => set((state) => {
        const isSaved = state.savedItems.includes(productId);
        return { 
          savedItems: isSaved 
            ? state.savedItems.filter(id => id !== productId)
            : [...state.savedItems, productId]
        };
      })
    }),
    {
      name: 'padelpro-market',
      partialize: (state) => ({ savedItems: state.savedItems, filters: state.filters })
    }
  )
);
