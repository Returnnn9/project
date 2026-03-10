import { EventEmitter } from "../core/EventEmitter";
import { Product } from "../types";

export class UIStore extends EventEmitter {
 private isCheckoutOpen: boolean = false;
 private selectedProduct: Product | null = null;
 private isCartOpen: boolean = false;
 private isAddressModalOpen: boolean = false;
 private isAuthModalOpen: boolean = false;
 private activeCategory: string = "desserts";
 private searchQuery: string = "";

 // Getters
 getIsCheckoutOpen() { return this.isCheckoutOpen; }
 getSelectedProduct() { return this.selectedProduct; }
 getIsCartOpen() { return this.isCartOpen; }
 getIsAddressModalOpen() { return this.isAddressModalOpen; }
 getIsAuthModalOpen() { return this.isAuthModalOpen; }
 getActiveCategory() { return this.activeCategory; }
 getSearchQuery() { return this.searchQuery; }

 // Setters
 setCheckoutOpen(open: boolean) {
  this.isCheckoutOpen = open;
  this.emitChange();
 }

 setSelectedProduct(product: Product | null) {
  this.selectedProduct = product;
  this.emitChange();
 }

 setCartOpen(open: boolean) {
  this.isCartOpen = open;
  this.emitChange();
 }

 setAddressModalOpen(open: boolean) {
  this.isAddressModalOpen = open;
  this.emitChange();
 }

 setAuthModalOpen(open: boolean) {
  this.isAuthModalOpen = open;
  this.emitChange();
 }

 setActiveCategory(category: string) {
  this.activeCategory = category;
  this.emitChange();
 }

 setSearchQuery(query: string) {
  this.searchQuery = query;
  this.emitChange();
 }
}
