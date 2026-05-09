import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Order, CartItem, Notification } from './types'

interface UserState {
 balance: number
 activeOrders: number
 address: string
 deliveryType: 'delivery' | 'pickup' | null
 hasSetAddress: boolean
 notifications: Notification[]
 userName: string
 userPhone: string
 favorites: number[]
 orderHistory: Order[]
 savedAddresses: string[]

 topUpBalance: (amount: number) => void
 updateAddress: (newAddress: string, type: 'delivery' | 'pickup') => void
 setHasSetAddress: (val: boolean) => void
 setUserName: (name: string) => void
 setUserPhone: (phone: string) => void
 toggleFavorite: (productId: number) => void
 checkout: (cartItems: CartItem[], total: number) => Promise<boolean>
 addSavedAddress: (address: string) => void
 removeSavedAddress: (address: string) => void
}

export const useUserStore = create<UserState>()(
 persist(
  (set, get) => ({
   balance: 0,
   activeOrders: 0,
   address: '',
   deliveryType: null,
   hasSetAddress: false,
   notifications: [],
   userName: '',
   userPhone: '',
   favorites: [],
   orderHistory: [],
   savedAddresses: [],

   topUpBalance: (amount) => set((state) => ({ balance: state.balance + amount })),

   updateAddress: (newAddress, type) => {
    set((state) => {
     const currentSaved = Array.isArray(state.savedAddresses) ? state.savedAddresses : []
     let updatedSaved = currentSaved
     if (type === 'delivery' && !currentSaved.includes(newAddress)) {
      updatedSaved = [newAddress, ...currentSaved].slice(0, 10)
     }
     return {
      address: newAddress,
      deliveryType: type,
      hasSetAddress: true,
      savedAddresses: updatedSaved,
     }
    })
   },

   setHasSetAddress: (val) => set({ hasSetAddress: val }),
   setUserName: (name) => set({ userName: name }),
   setUserPhone: (phone) => set({ userPhone: phone }),

   toggleFavorite: (productId) => {
    set((state) => {
     const currentFavorites = Array.isArray(state.favorites) ? state.favorites : []
     return {
      favorites: currentFavorites.includes(productId)
       ? currentFavorites.filter((id) => id !== productId)
       : [...currentFavorites, productId],
     }
    })
   },

   addSavedAddress: (address) => {
    set((state) => {
     const currentSaved = Array.isArray(state.savedAddresses) ? state.savedAddresses : []
     if (!currentSaved.includes(address)) {
      return { savedAddresses: [address, ...currentSaved].slice(0, 10) }
     }
     return state
    })
   },

   removeSavedAddress: (address) => {
    set((state) => {
     const currentSaved = Array.isArray(state.savedAddresses) ? state.savedAddresses : []
     return {
      savedAddresses: currentSaved.filter((a) => a !== address),
     }
    })
   },

   checkout: async (cartItems, total) => {
    if (cartItems.length === 0) return false

    const state = get()
    const order: Order = {
     id: Date.now(),
     items: [...cartItems],
     total,
     address: state.address,
     userName: state.userName || undefined,
     userPhone: state.userPhone || undefined,
    }

    const prevHistory = state.orderHistory
    const prevActive = state.activeOrders
    const prevNotifications = state.notifications

    set((s) => ({
     orderHistory: [order, ...s.orderHistory],
     activeOrders: s.activeOrders + 1,
     notifications: [
      { id: Date.now(), message: `Заказ на сумму ${total} ₽ успешно оформлен`, read: false },
      ...s.notifications,
     ],
    }))

    try {
     const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
     })
     if (!res.ok) throw new Error(`HTTP ${res.status}`)

     const savedOrder = await res.json()
     if (savedOrder?.id) {
      set((s) => ({
       orderHistory: s.orderHistory.map((o) =>
        o.id === order.id ? { ...o, id: savedOrder.id } : o
       ),
      }))
     }
     return true
    } catch (err) {
     console.error('[UserStore] checkout failed:', err)
     set({
      orderHistory: prevHistory,
      activeOrders: prevActive,
      notifications: prevNotifications,
     })
     return false
    }
   },
  }),
  {
   name: 'smuslest_user_v2',
   storage: createJSONStorage(() => localStorage),
  }
 )
)
