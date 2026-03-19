// Tipos globales del proyecto CREART

export interface Product {
  id: string
  name: string
  category: string
  price: number
  originalPrice?: number
  description: string
  rating: number
  reviews: number
  badge?: string
  discountEndDate?: string
  stock: number
  features: string[]
  image?: string
}

export interface CartItem extends Product {
  quantity: number
}

export interface Review {
  id: string
  productId: string
  userName: string
  rating: number
  comment: string
  date: string
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  address: string
  customerInfo: {
    name: string
    phone: string
    email?: string
    cedula?: string
    notes?: string
    paymentMethod: string
  }
  date: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
}

export interface Customer {
  name: string
  phone: string
  email: string
  address: string
}

export interface User {
  id: string
  email: string
  name: string
  isAdmin: boolean
}

export interface Coupon {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minPurchase?: number
  validUntil: string
}

export interface StoreSettings {
  whatsapp?: string
  minOrder?: number
  shippingCost?: number
  deliveryTime?: string
  paymentWhatsapp?: boolean
  paymentTransfer?: boolean
  paymentCash?: boolean
  returnPolicy?: boolean
  terms?: boolean
  privacy?: boolean
  categoriesVisibility?: Record<string, boolean>
}
