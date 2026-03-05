"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { products } from "@/components/data";

export interface Product {
 id: number;
 name: string;
 weight: string;
 price: number;
 oldPrice?: number;
 discount?: string;
 accent?: string;
 category: string;
 image: string;
 description?: string;
 composition?: string;
 nutrition?: {
  kcal: string;
  proteins: string;
  fats: string;
  carbs: string;
 };
}

export interface CartItem {
 id: number;
 name: string;
 image: string;
 price: number;
 oldPrice?: number;
 quantity: number;
}

export interface Notification {
 id: number;
 message: string;
 read: boolean;
}

interface AppState {
 cart: CartItem[];
 balance: number;
 activeOrders: number;
 address: string;
 notifications: Notification[];
 addToCart: (product: Product) => void;
 updateQuantity: (id: number, delta: number) => void;
 checkout: () => boolean;
 topUpBalance: (amount: number) => void;
 updateAddress: (newAddress: string) => void;
 isCheckoutOpen: boolean;
 setCheckoutOpen: (open: boolean) => void;
 selectedProduct: Product | null;
 setSelectedProduct: (product: Product | null) => void;
 isCartOpen: boolean;
 setCartOpen: (open: boolean) => void;
 isAddressModalOpen: boolean;
 setAddressModalOpen: (open: boolean) => void;
 isAuthModalOpen: boolean;
 setAuthModalOpen: (open: boolean) => void;
 userName: string;
 setUserName: (name: string) => void;
 userPhone: string;
 setUserPhone: (phone: string) => void;
 favorites: number[];
 toggleFavorite: (productId: number) => void;
 orderHistory: any[];
 activeCategory: string;
 setActiveCategory: (category: string) => void;
 searchQuery: string;
 setSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
 const [cart, setCart] = useState<CartItem[]>([]);
 const [balance, setBalance] = useState(1250);
 const [activeOrders, setActiveOrders] = useState(1);
 const [address, setAddress] = useState("акад. янгеля, д. 8");
 const [notifications, setNotifications] = useState<Notification[]>([
  { id: 1, message: "Заказ #4049 передан курьеру", read: false },
 ]);
 const [isCheckoutOpen, setCheckoutOpen] = useState(false);
 const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
 const [isCartOpen, setCartOpen] = useState(false);
 const [isAddressModalOpen, setAddressModalOpen] = useState(false);

 const [isAuthModalOpen, setAuthModalOpen] = useState(false);
 const [userName, setUserName] = useState("");
 const [userPhone, setUserPhone] = useState("");
 const [favorites, setFavorites] = useState<number[]>([]);
 const [orderHistory, setOrderHistory] = useState<any[]>([]);
 const [activeCategory, setActiveCategory] = useState("Десерты");
 const [searchQuery, setSearchQuery] = useState("");

 // Persistence: load on mount
 useEffect(() => {
  const savedCart = localStorage.getItem("smuslest_cart");
  if (savedCart) {
   try {
    setCart(JSON.parse(savedCart));
   } catch (e) {
    console.error("Failed to parse cart", e);
   }
  }
  const savedAddress = localStorage.getItem("smuslest_address");
  if (savedAddress) setAddress(savedAddress);

  const savedName = localStorage.getItem("smuslest_name");
  if (savedName) setUserName(savedName);

  const savedPhone = localStorage.getItem("smuslest_phone");
  if (savedPhone) setUserPhone(savedPhone);

  const savedFavorites = localStorage.getItem("smuslest_favorites");
  if (savedFavorites) {
   try {
    setFavorites(JSON.parse(savedFavorites));
   } catch (e) {
    console.error("Failed to parse favorites", e);
   }
  }

  const savedOrders = localStorage.getItem("smuslest_orders");
  if (savedOrders) {
   try {
    setOrderHistory(JSON.parse(savedOrders));
   } catch (e) {
    console.error("Failed to parse orders", e);
   }
  }
 }, []);

 // Persistence: save on change
 useEffect(() => {
  if (cart.length > 0) {
   localStorage.setItem("smuslest_cart", JSON.stringify(cart));
  } else {
   localStorage.removeItem("smuslest_cart");
  }
 }, [cart]);

 useEffect(() => {
  localStorage.setItem("smuslest_address", address);
  localStorage.setItem("smuslest_name", userName);
  localStorage.setItem("smuslest_phone", userPhone);
  localStorage.setItem("smuslest_favorites", JSON.stringify(favorites));
  localStorage.setItem("smuslest_orders", JSON.stringify(orderHistory));
 }, [address, userName, userPhone, favorites, orderHistory]);

 const addToCart = (product: Product) => {
  setCart((prev) => {
   const found = prev.find((i) => i.id === product.id);
   if (found) {
    return prev.map((i) =>
     i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
    );
   }
   return [
    ...prev,
    {
     id: product.id,
     name: product.name,
     image: product.image ?? "",
     price: product.price,
     oldPrice: product.oldPrice,
     quantity: 1,
    },
   ];
  });
 };

 const updateQuantity = (id: number, delta: number) => {
  setCart((prev) =>
   prev
    .map((i) =>
     i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i
    )
    .filter((i) => i.quantity > 0)
  );
 };

 const toggleFavorite = (productId: number) => {
  setFavorites((prev) =>
   prev.includes(productId)
    ? prev.filter((id) => id !== productId)
    : [...prev, productId]
  );
 };

 const checkout = () => {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  if (cart.length > 0) {
   const newOrder = {
    id: Date.now(),
    items: [...cart],
    total,
    date: new Date().toLocaleDateString("ru-RU", {
     day: "numeric",
     month: "long",
     year: "numeric",
    }),
    address,
   };
   setOrderHistory((prev) => [newOrder, ...prev]);
   setCart([]);
   setActiveOrders((o) => o + 1);
   setNotifications((prev) => [
    {
     id: Date.now(),
     message: `Заказ на сумму ${total} ₽ успешно оформлен`,
     read: false,
    },
    ...prev,
   ]);
   return true;
  }
  return false;
 };

 const topUpBalance = (amount: number) => {
  setBalance((b) => b + amount);
 };

 const updateAddress = (newAddress: string) => {
  setAddress(newAddress);
 };

 return (
  <AppContext.Provider
   value={{
    cart,
    balance,
    activeOrders,
    address,
    notifications,
    addToCart,
    updateQuantity,
    checkout,
    topUpBalance,
    updateAddress,
    isCheckoutOpen,
    setCheckoutOpen,
    selectedProduct,
    setSelectedProduct,
    isCartOpen,
    setCartOpen,
    isAddressModalOpen,
    setAddressModalOpen,
    isAuthModalOpen,
    setAuthModalOpen,
    userName,
    setUserName,
    userPhone,
    setUserPhone,
    favorites,
    toggleFavorite,
    orderHistory,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
   }}
  >
   {children}
  </AppContext.Provider>
 );
}

export function useApp() {
 const context = useContext(AppContext);
 if (context === undefined) {
  throw new Error("useApp must be used within an AppProvider");
 }
 return context;
}
