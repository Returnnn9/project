"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react"
import { products } from "@/components/data"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Product {
 id: number
 name: string
 weight: string
 price: number
 oldPrice?: number
 discount?: string
 accent?: string
 category: string
 image: string
 description?: string
 composition?: string
 nutrition?: {
  kcal: string
  proteins: string
  fats: string
  carbs: string
 }
}

export interface CartItem {
 id: number
 name: string
 image: string
 price: number
 oldPrice?: number
 quantity: number
}

export interface Notification {
 id: number
 message: string
 read: boolean
}

export interface Order {
 id: number
 items: CartItem[]
 total: number
 date: string
 address: string
}

// ─── Context Shape ───────────────────────────────────────────────────────────

interface AppState {
 cart: CartItem[]
 balance: number
 activeOrders: number
 address: string
 notifications: Notification[]
 addToCart: (product: Product) => void
 addMultipleToCart: (products: Product[]) => void
 updateQuantity: (id: number, delta: number) => void
 checkout: () => boolean
 topUpBalance: (amount: number) => void
 updateAddress: (newAddress: string) => void
 isCheckoutOpen: boolean
 setCheckoutOpen: (open: boolean) => void
 selectedProduct: Product | null
 setSelectedProduct: (product: Product | null) => void
 isCartOpen: boolean
 setCartOpen: (open: boolean) => void
 isAddressModalOpen: boolean
 setAddressModalOpen: (open: boolean) => void
 isAuthModalOpen: boolean
 setAuthModalOpen: (open: boolean) => void
 userName: string
 setUserName: (name: string) => void
 userPhone: string
 setUserPhone: (phone: string) => void
 favorites: number[]
 toggleFavorite: (productId: number) => void
 orderHistory: Order[]
 activeCategory: string
 setActiveCategory: (category: string) => void
 searchQuery: string
 setSearchQuery: (query: string) => void
 hasSetAddress: boolean
 setHasSetAddress: (val: boolean) => void
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeParseJSON<T>(key: string, fallback: T): T {
 try {
  const raw = localStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T) : fallback
 } catch {
  return fallback
 }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AppContext = createContext<AppState | undefined>(undefined)

// ─── Provider ────────────────────────────────────────────────────────────────

export function AppProvider({ children }: { children: ReactNode }) {
 const [cart, setCart] = useState<CartItem[]>([])
 const [balance, setBalance] = useState(1250)
 const [activeOrders, setActiveOrders] = useState(1)
 const [address, setAddress] = useState("") // Empty by default
 const [notifications, setNotifications] = useState<Notification[]>([
  { id: 1, message: "Заказ #4049 передан курьеру", read: false },
 ])

 const [isCheckoutOpen, setCheckoutOpen] = useState(false)
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
 const [isCartOpen, setCartOpen] = useState(false)
 const [isAddressModalOpen, setAddressModalOpen] = useState(false)
 const [isAuthModalOpen, setAuthModalOpen] = useState(false)

 const [userName, setUserName] = useState("")
 const [userPhone, setUserPhone] = useState("")
 const [favorites, setFavorites] = useState<number[]>([])
 const [orderHistory, setOrderHistory] = useState<Order[]>([])
 const [activeCategory, setActiveCategory] = useState("Десерты")
 const [searchQuery, setSearchQuery] = useState("")
 const [hasSetAddress, setHasSetAddress] = useState(false)

 // Load persisted state on mount
 useEffect(() => {
  setCart(safeParseJSON<CartItem[]>("smuslest_cart", []))
  setFavorites(safeParseJSON<number[]>("smuslest_favorites", []))
  setOrderHistory(safeParseJSON<Order[]>("smuslest_orders", []))

  const savedAddress = localStorage.getItem("smuslest_address")
  if (savedAddress) setAddress(savedAddress)

  const savedName = localStorage.getItem("smuslest_name")
  if (savedName) setUserName(savedName)

  const savedPhone = localStorage.getItem("smuslest_phone")
  if (savedPhone) setUserPhone(savedPhone)

  const savedHasSet = localStorage.getItem("smuslest_has_set_address")
  if (savedHasSet === "true") {
   setHasSetAddress(true)
  } else {
   // First visit OR address not set - open modal
   setAddressModalOpen(true)
  }
 }, [])

 // Persist cart
 useEffect(() => {
  if (cart.length > 0) {
   localStorage.setItem("smuslest_cart", JSON.stringify(cart))
  } else {
   localStorage.removeItem("smuslest_cart")
  }
 }, [cart])

 // Persist other state
 useEffect(() => {
  localStorage.setItem("smuslest_address", address)
  localStorage.setItem("smuslest_name", userName)
  localStorage.setItem("smuslest_phone", userPhone)
  localStorage.setItem("smuslest_favorites", JSON.stringify(favorites))
  localStorage.setItem("smuslest_orders", JSON.stringify(orderHistory))
  localStorage.setItem("smuslest_has_set_address", String(hasSetAddress))
 }, [address, userName, userPhone, favorites, orderHistory, hasSetAddress])

 // ── Actions ─────────────────────────────────────────────────────────────────

 const addToCart = (product: Product) => {
  setCart(prev => {
   const existing = prev.find(i => i.id === product.id)
   if (existing) {
    return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
   }
   return [...prev, {
    id: product.id,
    name: product.name,
    image: product.image ?? "",
    price: product.price,
    oldPrice: product.oldPrice,
    quantity: 1,
   }]
  })
 }

 const addMultipleToCart = (productsToAdd: Product[]) => {
  setCart(prev => {
   let newCart = [...prev]
   productsToAdd.forEach(product => {
    const existing = newCart.find(i => i.id === product.id)
    if (existing) {
     newCart = newCart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
    } else {
     newCart.push({
      id: product.id,
      name: product.name,
      image: product.image ?? "",
      price: product.price,
      oldPrice: product.oldPrice,
      quantity: 1,
     })
    }
   })
   return newCart
  })
 }

 const updateQuantity = (id: number, delta: number) => {
  setCart(prev =>
   prev
    .map(i => i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
    .filter(i => i.quantity > 0)
  )
 }

 const toggleFavorite = (productId: number) => {
  setFavorites(prev =>
   prev.includes(productId)
    ? prev.filter(id => id !== productId)
    : [...prev, productId]
  )
 }

 const checkout = (): boolean => {
  if (cart.length === 0) return false

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const order: Order = {
   id: Date.now(),
   items: [...cart],
   total,
   date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
   address,
  }

  setOrderHistory(prev => [order, ...prev])
  setCart([])
  setActiveOrders(n => n + 1)
  setNotifications(prev => [
   { id: Date.now(), message: `Заказ на сумму ${total} ₽ успешно оформлен`, read: false },
   ...prev,
  ])
  return true
 }

 const topUpBalance = (amount: number) => setBalance(b => b + amount)
 const updateAddress = (newAddress: string) => {
  setAddress(newAddress)
  setHasSetAddress(true)
 }

 // ── Context Value ─────────────────────────────────────────────────────────────

 return (
  <AppContext.Provider value={{
   cart, balance, activeOrders, address, notifications,
   addToCart, addMultipleToCart, updateQuantity, checkout, topUpBalance, updateAddress,
   isCheckoutOpen, setCheckoutOpen,
   selectedProduct, setSelectedProduct,
   isCartOpen, setCartOpen,
   isAddressModalOpen, setAddressModalOpen,
   isAuthModalOpen, setAuthModalOpen,
   userName, setUserName,
   userPhone, setUserPhone,
   favorites, toggleFavorite,
   orderHistory,
   activeCategory, setActiveCategory,
   searchQuery, setSearchQuery,
   hasSetAddress, setHasSetAddress,
  }}>
   {children}
  </AppContext.Provider>
 )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApp(): AppState {
 const context = useContext(AppContext)
 if (!context) throw new Error("useApp must be used within an AppProvider")
 return context
}
