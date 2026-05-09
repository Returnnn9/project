import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Product, CartItem } from './types'

interface CartState {
  cart: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  addMultipleToCart: (products: Product[]) => void
  updateQuantity: (id: number, delta: number) => void
  clearCart: () => void
  getCartTotal: () => number
  getCartCount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product, quantity = 1) => {
        set((state) => {
          const currentCart = Array.isArray(state.cart) ? state.cart : []
          const existingIndex = currentCart.findIndex((i) => i.id === product.id)
          if (existingIndex >= 0) {
            const newCart = [...state.cart]
            newCart[existingIndex] = {
              ...newCart[existingIndex],
              quantity: newCart[existingIndex].quantity + quantity,
            }
            return { cart: newCart }
          }
          return {
            cart: [
              ...currentCart,
              {
                id: product.id,
                name: product.name,
                image: product.image ?? '',
                price: product.price,
                oldPrice: product.oldPrice,
                quantity,
              },
            ],
          }
        })
      },

      addMultipleToCart: (productsToAdd) => {
        set((state) => {
          const currentCart = Array.isArray(state.cart) ? state.cart : []
          let newCart = [...currentCart]
          productsToAdd.forEach((product) => {
            const qty = product.quantity ?? 1
            const existingIndex = newCart.findIndex((i) => i.id === product.id)
            if (existingIndex >= 0) {
              newCart[existingIndex] = {
                ...newCart[existingIndex],
                quantity: newCart[existingIndex].quantity + qty,
              }
            } else {
              newCart.push({
                id: product.id,
                name: product.name,
                image: product.image ?? '',
                price: product.price,
                oldPrice: product.oldPrice,
                quantity: qty,
              })
            }
          })
          return { cart: newCart }
        })
      },

      updateQuantity: (id, delta) => {
        set((state) => {
          const currentCart = Array.isArray(state.cart) ? state.cart : []
          return {
            cart: currentCart
              .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
              .filter((i) => i.quantity > 0),
          }
        })
      },

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },

      getCartCount: () => {
        return get().cart.reduce((sum, item) => sum + item.quantity, 0)
      },
    }),
    {
      name: 'smuslest_cart_v2',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
