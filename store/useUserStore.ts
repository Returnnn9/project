import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Order, CartItem, Notification } from './types'
import { AddressEntity } from '@/lib/types/address'
import { migrateStringAddress } from '@/lib/address'

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
  savedAddresses: AddressEntity[]
  currentAddressEntity: AddressEntity | null

  topUpBalance: (amount: number) => void
  updateAddress: (entity: AddressEntity, type: 'delivery' | 'pickup') => void
  setHasSetAddress: (val: boolean) => void
  setUserName: (name: string) => void
  setUserPhone: (phone: string) => void
  toggleFavorite: (productId: number) => void
  checkout: (cartItems: CartItem[], total: number) => Promise<boolean>
  addSavedAddress: (entity: AddressEntity) => void
  removeSavedAddress: (displayLine: string) => void
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
      currentAddressEntity: null,

      topUpBalance: (amount) => set((state) => ({ balance: state.balance + amount })),

      updateAddress: (entity, type) => {
        set((state) => {
          const currentSaved = Array.isArray(state.savedAddresses) ? state.savedAddresses : []
          let updatedSaved = currentSaved
          if (type === 'delivery') {
            const isDup = currentSaved.some(
              (a) => typeof a === 'object' && a.displayLine === entity.displayLine
            )
            if (!isDup) updatedSaved = [entity, ...currentSaved].slice(0, 10)
          }
          return {
            address: entity.full,
            currentAddressEntity: entity,
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

      addSavedAddress: (entity) => {
        set((state) => {
          const currentSaved = Array.isArray(state.savedAddresses) ? state.savedAddresses : []
          const isDup = currentSaved.some(
            (a) => typeof a === 'object' && a.displayLine === entity.displayLine
          )
          if (!isDup) return { savedAddresses: [entity, ...currentSaved].slice(0, 10) }
          return state
        })
      },

      removeSavedAddress: (displayLine) => {
        set((state) => {
          const currentSaved = Array.isArray(state.savedAddresses) ? state.savedAddresses : []
          return {
            savedAddresses: currentSaved.filter(
              (a) => typeof a === 'object' && a.displayLine !== displayLine
            ),
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
          set({ orderHistory: prevHistory, activeOrders: prevActive, notifications: prevNotifications })
          return false
        }
      },
    }),
    {
      name: 'smuslest_user_v2',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // Migrate savedAddresses from string[] (v2 old format) to AddressEntity[]
        if (
          Array.isArray(state.savedAddresses) &&
          state.savedAddresses.length > 0 &&
          typeof state.savedAddresses[0] === 'string'
        ) {
          state.savedAddresses = (state.savedAddresses as unknown as string[]).map(
            migrateStringAddress
          )
        }
        // Migrate current address string to entity if not yet set
        if (state.address && !state.currentAddressEntity) {
          state.currentAddressEntity = migrateStringAddress(state.address)
        }
      },
    }
  )
)
