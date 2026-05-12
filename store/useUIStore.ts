import { create } from 'zustand'
import { Product } from './types'

interface UIState {
 isCartOpen: boolean
 isCheckoutOpen: boolean
 isAddressModalOpen: boolean
 isAuthModalOpen: boolean
 selectedProduct: Product | null
 activeCategory: string
 searchQuery: string

 setCartOpen: (open: boolean) => void
 setCheckoutOpen: (open: boolean) => void
 setAddressModalOpen: (open: boolean) => void
 setAuthModalOpen: (open: boolean) => void
 setSelectedProduct: (product: Product | null) => void
 setActiveCategory: (category: string) => void
 setSearchQuery: (query: string) => void
}

export const useUIStore = create<UIState>((set) => ({
 isCartOpen: false,
 isCheckoutOpen: false,
 isAddressModalOpen: false,
 isAuthModalOpen: false,
 selectedProduct: null,
 activeCategory: 'desserts',
 searchQuery: '',

 setCartOpen: (open) => set({ isCartOpen: open }),
 setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),
 setAddressModalOpen: (open) => set({ isAddressModalOpen: open }),
 setAuthModalOpen: (open) => set({ isAuthModalOpen: open }),
 setSelectedProduct: (product) => set({ selectedProduct: product }),
 setActiveCategory: (category) => set({ activeCategory: category }),
 setSearchQuery: (query) => set({ searchQuery: query }),
}))
