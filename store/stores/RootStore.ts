import { CartStore } from "./CartStore";
import { UserStore } from "./UserStore";
import { UIStore } from "./UIStore";
import { ProductStore } from "./ProductStore";
import { safeParseJSON, CartItem, Order } from "../types";

export class RootStore {
 cartStore: CartStore;
 userStore: UserStore;
 uiStore: UIStore;
 productStore: ProductStore;

 constructor() {
  this.cartStore = new CartStore();
  this.userStore = new UserStore(this);
  this.uiStore = new UIStore();
  this.productStore = new ProductStore();
 }

  // Called once on mount to hydrate data from localStorage
  hydrate() {
    if (typeof window === "undefined") return;

    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || "");
      return null;
    };

    this.cartStore.init(safeParseJSON<CartItem[]>("smuslest_cart", []));

    const favorites = safeParseJSON<number[]>("smuslest_favorites", []);
    const orderHistory = safeParseJSON<Order[]>("smuslest_orders", []);
    
    // Try localStorage first, then cookies
    const address = localStorage.getItem("smuslest_address") || getCookie("smuslest_address");
    const deliveryType = localStorage.getItem("smuslest_delivery_type") as "delivery" | "pickup" | null;
    const userName = localStorage.getItem("smuslest_name");
    const userPhone = localStorage.getItem("smuslest_phone");
    const hasSetAddressStr = localStorage.getItem("smuslest_has_set_address") || getCookie("smuslest_has_set_address");
    const hasSetAddress = hasSetAddressStr === "true";

    const rawSaved = localStorage.getItem("smuslest_saved_addresses") || getCookie("smuslest_saved_addresses");
    const savedAddresses = this.safeParseJSONStatic<string[]>(rawSaved || "[]") || [];

    this.userStore.init({
      favorites,
      orderHistory,
      address,
      savedAddresses,
      deliveryType,
      userName,
      userPhone,
      hasSetAddress
    });

    if (!hasSetAddress) {
      this.uiStore.setAddressModalOpen(true);
    }
  }

  private safeParseJSONStatic<T>(str: string): T | null {
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

 // Helper method to wire up stores logic together if needed
 checkout(): boolean {
  const items = this.cartStore.getCart();
  const total = this.cartStore.getCartTotal();
  const success = this.userStore.checkout(items, total);

  if (success) {
   this.cartStore.clearCart();
  }

  return success;
 }
}

export const rootStore = new RootStore();
