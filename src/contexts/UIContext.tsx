import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import type { Product, Review, Order, StoreSettings } from '../types'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface UIContextType {
  // Wishlist
  wishlist: Product[]
  wishlistCount: number
  toggleWishlist: (product: Product) => void
  isInWishlist: (productId: string) => boolean
  
  // Compare
  compareList: Product[]
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: string) => void
  isInCompare: (productId: string) => boolean
  getRelatedProducts: (productId: string) => Product[]
  
  // Reviews
  reviews: Review[]
  addReview: (productId: string, rating: number, comment: string) => void
  getReviewsByProduct: (productId: string) => Review[]
  
  // Orders
  orders: Order[]
  addOrder: (items: any[], total: number, address: string, customerInfo: any) => void
  
  // Toast notifications
  toasts: Toast[]
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
  removeToast: (id: string) => void
  
  // Settings
  storeSettings: StoreSettings
  updateStoreSettings: (settings: Partial<StoreSettings>) => void
  
  // Viewed products
  viewedProducts: Product[]
  addToHistory: (product: Product) => void
  clearHistory: () => void
}

const UIContext = createContext<UIContextType | undefined>(undefined)

const defaultStoreSettings: StoreSettings = {
  whatsapp: '573159934696',
  minOrder: 500000,
  shippingCost: 15000,
  deliveryTime: '3-5 días hábiles',
  paymentWhatsapp: true,
  paymentTransfer: true,
  paymentCash: true,
  returnPolicy: true,
  terms: true,
  privacy: true,
}

export function UIProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('creart_wishlist')
    return saved ? JSON.parse(saved) : []
  })

  const [compareList, setCompareList] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('creart_compare')
    return saved ? JSON.parse(saved) : []
  })

  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('creart_orders')
    return saved ? JSON.parse(saved) : []
  })

  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('creart_reviews')
    return saved ? JSON.parse(saved) : []
  })

  const [viewedProducts, setViewedProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('creart_history')
    return saved ? JSON.parse(saved) : []
  })

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    if (typeof window === 'undefined') return defaultStoreSettings
    const saved = localStorage.getItem('creart_settings')
    return saved ? JSON.parse(saved) : defaultStoreSettings
  })

  const [toasts, setToasts] = useState<Toast[]>([])

  // Wishlist functions
  const toggleWishlist = useCallback((product: Product) => {
    setWishlist(prev => {
      const exists = prev.find(p => p.id === product.id)
      let newWishlist: Product[]
      if (exists) {
        newWishlist = prev.filter(p => p.id !== product.id)
      } else {
        newWishlist = [...prev, product]
      }
      localStorage.setItem('creart_wishlist', JSON.stringify(newWishlist))
      return newWishlist
    })
  }, [])

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.some(p => p.id === productId)
  }, [wishlist])

  // Compare functions
  const addToCompare = useCallback((product: Product) => {
    setCompareList(prev => {
      if (prev.length >= 4) return prev
      if (prev.find(p => p.id === product.id)) return prev
      const newList = [...prev, product]
      localStorage.setItem('creart_compare', JSON.stringify(newList))
      return newList
    })
  }, [])

  const removeFromCompare = useCallback((productId: string) => {
    setCompareList(prev => {
      const newList = prev.filter(p => p.id !== productId)
      localStorage.setItem('creart_compare', JSON.stringify(newList))
      return newList
    })
  }, [])

  const isInCompare = useCallback((productId: string) => {
    return compareList.some(p => p.id === productId)
  }, [compareList])

  const getRelatedProducts = useCallback((productId: string) => {
    const product = compareList.find(p => p.id === productId)
    if (!product) return []
    return compareList.filter(p => p.id !== productId && p.category === product.category).slice(0, 4)
  }, [compareList])

  // Reviews functions
  const addReview = useCallback((productId: string, rating: number, comment: string) => {
    const newReview: Review = {
      id: Date.now().toString(),
      productId,
      userName: 'Usuario Anónimo',
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    }
    setReviews(prev => {
      const newReviews = [...prev, newReview]
      localStorage.setItem('creart_reviews', JSON.stringify(newReviews))
      return newReviews
    })
  }, [])

  const getReviewsByProduct = useCallback((productId: string) => {
    return reviews.filter(r => r.productId === productId)
  }, [reviews])

  // Orders functions
  const addOrder = useCallback((items: any[], total: number, address: string, customerInfo: any) => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      items,
      total,
      address,
      customerInfo,
      date: new Date().toISOString(),
      status: 'pending'
    }
    setOrders(prev => {
      const newOrders = [newOrder, ...prev]
      localStorage.setItem('creart_orders', JSON.stringify(newOrders))
      return newOrders
    })
  }, [])

  // Toast functions
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  // Settings functions
  const updateStoreSettings = useCallback((settings: Partial<StoreSettings>) => {
    setStoreSettings(prev => {
      const newSettings = { ...prev, ...settings }
      localStorage.setItem('creart_settings', JSON.stringify(newSettings))
      return newSettings
    })
  }, [])

  // History functions
  const addToHistory = useCallback((product: Product) => {
    setViewedProducts(prev => {
      const filtered = prev.filter(p => p.id !== product.id)
      const newHistory = [product, ...filtered].slice(0, 20)
      localStorage.setItem('creart_history', JSON.stringify(newHistory))
      return newHistory
    })
  }, [])

  const clearHistory = useCallback(() => {
    setViewedProducts([])
    localStorage.removeItem('creart_history')
  }, [])

  // Memoized values
  const wishlistCount = useMemo(() => wishlist.length, [wishlist])

  const value = useMemo(() => ({
    wishlist,
    wishlistCount,
    toggleWishlist,
    isInWishlist,
    compareList,
    addToCompare,
    removeFromCompare,
    isInCompare,
    getRelatedProducts,
    reviews,
    addReview,
    getReviewsByProduct,
    orders,
    addOrder,
    toasts,
    showToast,
    removeToast,
    storeSettings,
    updateStoreSettings,
    viewedProducts,
    addToHistory,
    clearHistory,
  }), [wishlist, wishlistCount, toggleWishlist, isInWishlist, compareList, addToCompare, removeFromCompare, isInCompare, getRelatedProducts, reviews, addReview, getReviewsByProduct, orders, addOrder, toasts, showToast, removeToast, storeSettings, updateStoreSettings, viewedProducts, addToHistory, clearHistory])

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}

export default UIContext
