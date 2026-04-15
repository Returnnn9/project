import { EventEmitter } from "../core/EventEmitter";
import { Product, CartItem } from "../types";

export class CartStore extends EventEmitter {
 private cart: CartItem[] = [];

 constructor() {
  super();
 }

 init(savedCart: CartItem[]) {
  this.cart = savedCart;
  this.emitChange();
 }

 getCart(): CartItem[] {
  return this.cart;
 }

 getCartTotal(): number {
  return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
 }

 addToCart(product: Product, addQuantity: number = 1): void {
  const existingIndex = this.cart.findIndex((i) => i.id === product.id);
  if (existingIndex >= 0) {
   const newCart = [...this.cart];
   newCart[existingIndex] = {
    ...newCart[existingIndex],
    quantity: newCart[existingIndex].quantity + addQuantity,
   };
   this.cart = newCart;
  } else {
   this.cart = [
    ...this.cart,
    {
     id: product.id,
     name: product.name,
     image: product.image ?? "",
     price: product.price,
     oldPrice: product.oldPrice,
     quantity: addQuantity,
    },
   ];
  }
  this.save();
  this.emitChange();
 }

 addMultipleToCart(products: Product[]): void {
  let newCart = [...this.cart];
  products.forEach((product) => {
   const qty = product.quantity ?? 1;
   const existingIndex = newCart.findIndex((i) => i.id === product.id);
   if (existingIndex >= 0) {
    newCart[existingIndex] = {
     ...newCart[existingIndex],
     quantity: newCart[existingIndex].quantity + qty,
    };
   } else {
    newCart.push({
     id: product.id,
     name: product.name,
     image: product.image ?? '',
     price: product.price,
     oldPrice: product.oldPrice,
     quantity: qty,
    });
   }
  });
  this.cart = newCart;
  this.save();
  this.emitChange();
 }

 updateQuantity(id: number, delta: number): void {
  this.cart = this.cart
   .map((i) => (i.id === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
   .filter((i) => i.quantity > 0);
  this.save();
  this.emitChange();
 }

 clearCart(): void {
  this.cart = [];
  this.save();
  this.emitChange();
 }

 private save() {
  if (typeof window !== "undefined") {
   if (this.cart.length > 0) {
    localStorage.setItem("smuslest_cart", JSON.stringify(this.cart));
   } else {
    localStorage.removeItem("smuslest_cart");
   }
  }
 }
}
