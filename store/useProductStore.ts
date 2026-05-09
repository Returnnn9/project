import { create } from 'zustand'
import { Product } from './types'

interface ProductState {
 products: Product[]
 isLoading: boolean
 error: string | null
 fetchProducts: () => Promise<void>
 addProduct: (formData: FormData) => Promise<void>
 updateProduct: (id: number, formData: FormData) => Promise<void>
 deleteProduct: (id: number) => Promise<void>
}

export const useProductStore = create<ProductState>((set) => ({
 products: [],
 isLoading: false,
 error: null,

 fetchProducts: async () => {
  set({ isLoading: true, error: null })
  try {
   const res = await fetch('/api/products')
   if (!res.ok) throw new Error('Network response was not ok')
   const data: Product[] = await res.json()
   set({ products: data, isLoading: false })
  } catch (err) {
   set({ error: err instanceof Error ? err.message : 'Unknown error', isLoading: false })
  }
 },

 addProduct: async (formData: FormData) => {
  try {
   const res = await fetch('/api/products', {
    method: 'POST',
    body: formData,
   })
   if (!res.ok) throw new Error('Failed to add product')
   const newProduct: Product = await res.json()
   set((state) => ({ products: [...state.products, newProduct] }))
  } catch (err) {
   throw err;
  }
 },

 updateProduct: async (id: number, formData: FormData) => {
  try {
   const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    body: formData,
   })
   if (!res.ok) throw new Error('Failed to update product')
   const updatedProduct: Product = await res.json()
   set((state) => ({
    products: state.products.map(p => p.id === id ? updatedProduct : p)
   }))
  } catch (err) {
   throw err;
  }
 },

 deleteProduct: async (id: number) => {
  try {
   const res = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
   })
   if (!res.ok) throw new Error('Failed to delete product')
   set((state) => ({
    products: state.products.filter(p => p.id !== id)
   }))
  } catch (err) {
   throw err;
  }
 }
}))
