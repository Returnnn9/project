import { EventEmitter } from "../core/EventEmitter";
import { Order, CartItem, Notification } from "../types";
import type { RootStore } from "./RootStore";

export class UserStore extends EventEmitter {
 private root: RootStore;

 private balance: number = 0;
 private activeOrders: number = 0;
 private address: string = "";
 private deliveryType: "delivery" | "pickup" | null = null;
 private hasSetAddress: boolean = false;

 private notifications: Notification[] = [];
 private userName: string = "";
 private userPhone: string = "";
 private favorites: number[] = [];
 private orderHistory: Order[] = [];
 private savedAddresses: string[] = []; 

 constructor(rootStore: RootStore) {
  super();
  this.root = rootStore;
 }

 init(data: {
  favorites: number[];
  orderHistory: Order[];
  address: string | null;
  savedAddresses: string[] | null;
  deliveryType: "delivery" | "pickup" | null;
  userName: string | null;
  userPhone: string | null;
  hasSetAddress: boolean;
 }) {
  this.favorites = data.favorites;
  this.orderHistory = data.orderHistory;
  if (data.address) this.address = data.address;
  if (data.savedAddresses) this.savedAddresses = data.savedAddresses;
  if (data.deliveryType) this.deliveryType = data.deliveryType;
  if (data.userName) this.userName = data.userName;
  if (data.userPhone) this.userPhone = data.userPhone;
  this.hasSetAddress = data.hasSetAddress;
  this.emitChange();
 }

 // Getters
 getBalance() { return this.balance; }
 getActiveOrders() { return this.activeOrders; }
 getAddress() { return this.address; }
 getDeliveryType() { return this.deliveryType; }
 getHasSetAddress() { return this.hasSetAddress; }
 getNotifications() { return this.notifications; }
 getUserName() { return this.userName; }
 getUserPhone() { return this.userPhone; }
 getFavorites() { return this.favorites; }
 getOrderHistory() { return this.orderHistory; }
 getSavedAddresses() { return this.savedAddresses; }

 // Actions
 topUpBalance(amount: number) {
  this.balance += amount;
  this.emitChange();
 }

 updateAddress(newAddress: string, type: "delivery" | "pickup") {
  this.address = newAddress;
  this.deliveryType = type;
  this.hasSetAddress = true;
  
  if (type === "delivery" && !this.savedAddresses.includes(newAddress)) {
   this.savedAddresses = [newAddress, ...this.savedAddresses];
   this.saveSavedAddresses();
  }

  this.saveAddress();
  this.emitChange();
 }

 addSavedAddress(address: string) {
   if (!this.savedAddresses.includes(address)) {
     this.savedAddresses = [address, ...this.savedAddresses];
     this.saveSavedAddresses();
     this.emitChange();
   }
 }

 removeSavedAddress(address: string) {
   this.savedAddresses = this.savedAddresses.filter(a => a !== address);
   this.saveSavedAddresses();
   this.emitChange();
 }

 setHasSetAddress(val: boolean) {
  this.hasSetAddress = val;
  this.saveAddress();
  this.emitChange();
 }

 setUserName(name: string) {
  this.userName = name;
  this.saveUser();
  this.emitChange();
 }

 setUserPhone(phone: string) {
  this.userPhone = phone;
  this.saveUser();
  this.emitChange();
 }

 toggleFavorite(productId: number) {
  if (this.favorites.includes(productId)) {
   this.favorites = this.favorites.filter((id) => id !== productId);
  } else {
   this.favorites = [...this.favorites, productId];
  }
  this.saveFavorites();
  this.emitChange();
 }

 async checkout(cartItems: CartItem[], total: number): Promise<boolean> {
  if (cartItems.length === 0) return false;

  const order: Order = {
   id: Date.now(),
   items: [...cartItems],
   total,
   date: new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }),
   address: this.address,
   userName: this.userName || undefined,
   userPhone: this.userPhone || undefined,
  };

  // Optimistic update
  const prevOrderHistory = this.orderHistory;
  const prevActiveOrders = this.activeOrders;
  const prevNotifications = this.notifications;

  this.orderHistory = [order, ...this.orderHistory];
  this.activeOrders += 1;
  this.notifications = [
   { id: Date.now(), message: `Заказ на сумму ${total} ₽ успешно оформлен`, read: false },
   ...this.notifications,
  ];
  this.saveOrders();
  this.emitChange();

  // Persist to backend — rollback on failure
  if (typeof window !== "undefined") {
   try {
    const res = await fetch('/api/orders', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
   } catch (err) {
    console.error("[UserStore] Failed to persist order, rolling back:", err);
    // Rollback optimistic update
    this.orderHistory = prevOrderHistory;
    this.activeOrders = prevActiveOrders;
    this.notifications = prevNotifications;
    this.saveOrders();
    this.emitChange();
    return false;
   }
  }

  return true;
 }

  private setCookie(name: string, value: string, days: number = 365) {

   if (typeof window !== "undefined") {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
   }
  }

  private saveAddress() {
   if (typeof window !== "undefined") {
    localStorage.setItem("smuslest_address", this.address);
    localStorage.setItem("smuslest_delivery_type", this.deliveryType || "");
    localStorage.setItem("smuslest_has_set_address", String(this.hasSetAddress));
    
    // Also save to cookies for persistence
    this.setCookie("smuslest_address", this.address);
    this.setCookie("smuslest_has_set_address", String(this.hasSetAddress));
   }
  }

  private saveUser() {
   if (typeof window !== "undefined") {
    localStorage.setItem("smuslest_name", this.userName);
    localStorage.setItem("smuslest_phone", this.userPhone);
   }
  }

  private saveFavorites() {
   if (typeof window !== "undefined") {
    localStorage.setItem("smuslest_favorites", JSON.stringify(this.favorites));
   }
  }

  private saveSavedAddresses() {
   if (typeof window !== "undefined") {
    localStorage.setItem("smuslest_saved_addresses", JSON.stringify(this.savedAddresses));
    this.setCookie("smuslest_saved_addresses", JSON.stringify(this.savedAddresses));
   }
  }

  private saveOrders() {
   if (typeof window !== "undefined") {
    localStorage.setItem("smuslest_orders", JSON.stringify(this.orderHistory));
   }
  }
}
