"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
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

 const checkout = () => {
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  if (balance >= total && cart.length > 0) {
   setBalance((b) => b - total);
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
