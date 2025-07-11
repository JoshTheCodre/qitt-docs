
import { create } from 'zustand'

const useStore = create((set, get) => ({
  // User state
  user: null,
  setUser: (user) => set({ user }),

  // Selected resource state
  selectedResource: null,
  setSelectedResource: (resource) => set({ selectedResource: resource }),

  // Loading states
  loading: false,
  setLoading: (loading) => set({ loading }),

  // Profile state
  profile: null,
  setProfile: (profile) => set({ profile }),

  // Resources state
  resources: [],
  setResources: (resources) => set({ resources }),

  // Search state
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}))

export default useStore
