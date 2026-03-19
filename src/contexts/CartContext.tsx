import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import type { Product } from '../types'

interface CartItem extends Product {
  quantity: number
}

interface CartContextType {
  cart: CartItem[]
  cartCount: number
  cartSubtotal: number
  cartIVA: number
  cartTotal: number
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = localStorage.getItem('creart_cart')
    return saved ? JSON.parse(saved) : []
  })

  // Agregar al carrito
  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      let newCart: CartItem[]
      
      if (existing) {
        newCart = prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        newCart = [...prev, { ...product, quantity: 1 }]
      }
      
      localStorage.setItem('creart_cart', JSON.stringify(newCart))
      return newCart
    })
  }, [])

  // Remover del carrito
  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => {
      const newCart = prev.filter(item => item.id !== productId)
      localStorage.setItem('creart_cart', JSON.stringify(newCart))
      return newCart
    })
  }, [])

  // Actualizar cantidad
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }
    setCart(prev => {
      const newCart = prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
      localStorage.setItem('creart_cart', JSON.stringify(newCart))
      return newCart
    })
  }, [removeFromCart])

  // Limpiar carrito
  const clearCart = useCallback(() => {
    setCart([])
    localStorage.removeItem('creart_cart')
  }, [])

  // Valores memoizados
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart])
  const cartSubtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart])
  const cartIVA = useMemo(() => cartSubtotal * 0.19, [cartSubtotal])
  const cartTotal = useMemo(() => cartSubtotal + cartIVA, [cartSubtotal, cartIVA])

  const value = useMemo(() => ({
    cart,
    cartCount,
    cartSubtotal,
    cartIVA,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  }), [cart, cartCount, cartSubtotal, cartIVA, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export default CartContext
