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
 type?: 'empty' | 'product'
 gridArea?: string
 quantity?: number
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
 address: string
 status?: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
 userName?: string
 userPhone?: string
 createdAt?: string
}

export function safeParseJSON<T>(key: string, fallback: T): T {
 if (typeof window === 'undefined') return fallback;
 try {
  const raw = localStorage.getItem(key)
  return raw ? (JSON.parse(raw) as T) : fallback
 } catch {
  return fallback
 }
}
