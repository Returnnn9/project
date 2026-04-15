import { EventEmitter } from "../core/EventEmitter";
import { Product } from "../types";

export class ProductStore extends EventEmitter {
 private products: Product[] = [];
 private isLoading: boolean = false;
 private error: string | null = null;

 constructor() {
  super();
 }

 init(savedProducts: Product[]) {
  this.products = savedProducts;
  this.emitChange();
 }

 getProducts(): Product[] {
  return this.products;
 }

 getIsLoading(): boolean {
  return this.isLoading;
 }

 getError(): string | null {
  return this.error;
 }

 async fetchProducts(): Promise<void> {
  this.isLoading = true;
  this.error = null;
  this.emitChange();

  try {
   const res = await fetch('/api/products');
   if (!res.ok) throw new Error('Network response was not ok');
   const data: Product[] = await res.json();
   this.products = data;
   this.isLoading = false;
   this.emitChange();
  } catch (err: unknown) {
   this.error = err instanceof Error ? err.message : String(err);
   this.isLoading = false;
   this.emitChange();
  }
 }

 async addProduct(formData: FormData): Promise<void> {
  try {
   const res = await fetch('/api/products', {
    method: 'POST',
    body: formData,
   });
   if (!res.ok) throw new Error('Failed to add product');
   const newProduct: Product = await res.json();
   this.products = [...this.products, newProduct];
   this.emitChange();
  } catch (err: unknown) {
   this.error = err instanceof Error ? err.message : String(err);
   this.emitChange();
   throw err;
  }
 }

 async updateProduct(id: number, formData: FormData): Promise<void> {
  try {
   const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    body: formData,
   });
   if (!res.ok) throw new Error('Failed to update product');
   const updatedProduct: Product = await res.json();
   this.products = this.products.map(p => p.id === id ? updatedProduct : p);
   this.emitChange();
  } catch (err: unknown) {
   this.error = err instanceof Error ? err.message : String(err);
   this.emitChange();
   throw err;
  }
 }

 async deleteProduct(id: number): Promise<void> {
  try {
   const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
   });
   if (!res.ok) throw new Error('Failed to delete product');
   this.products = this.products.filter(p => p.id !== id);
   this.emitChange();
  } catch (err: unknown) {
   this.error = err instanceof Error ? err.message : String(err);
   this.emitChange();
   throw err;
  }
 }
}
