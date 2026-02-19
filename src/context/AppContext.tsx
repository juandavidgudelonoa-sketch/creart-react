import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Types
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
  image?: string
  discountEndDate?: string
  stock?: number
  features?: string[]
  featured?: boolean
}

export interface CartItem extends Product {
  quantity: number
}

export interface Order {
  id: string
  date: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled'
  trackingNumber?: string
  shippingAddress?: string
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  customerCedula?: string
  customerNotes?: string
  paymentMethod?: string
}

export interface Customer {
  name: string
  phone: string
  email: string
  address: string
}

export interface User {
  id: string
  name: string
  email: string
  interests?: string[]
  isAdmin?: boolean
}

export interface Review {
  id: string
  productId: string
  userName: string
  rating: number
  comment: string
  date: string
}

export interface Coupon {
  code: string
  discount: number
  type: 'percentage' | 'fixed'
  minPurchase?: number
  validUntil?: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  read: boolean
  date: string
}

export interface StoreSettings {
  // Company info
  storeName: string
  slogan: string
  description: string
  city: string
  address: string
  phone: string
  whatsapp: string
  email: string
  
  // Social media
  facebook: string
  instagram: string
  youtube: string
  tiktok: string
  
  // Order settings
  minOrder: number
  shippingCost: number
  deliveryTime: string
  
  // Payment methods
  paymentWhatsapp: boolean
  paymentTransfer: boolean
  paymentCash: boolean
  
  // Policies
  returnPolicy: string
  terms: string
  privacy: string

  // Categories visibility
  categoriesVisibility: Record<string, boolean>
}

interface AppContextType {
  // Products
  products: Product[]
  getProductsByCategory: (category: string) => Product[]
  searchProducts: (query: string) => Product[]
  getProductById: (id: string) => Product | undefined
  getRelatedProducts: (productId: string) => Product[]
  addProduct: (product: Omit<Product, 'id'>) => void
  updateProduct: (id: string, product: Partial<Product>) => void
  deleteProduct: (id: string) => void
  
  // Cart
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  cartCount: number
  cartSubtotal: number
  cartIVA: number
  cartTotal: number
  
  // Wishlist
  wishlist: Product[]
  toggleWishlist: (product: Product) => void
  isInWishlist: (productId: string) => boolean
  wishlistCount: number
  
  // Compare
  compareList: Product[]
  addToCompare: (product: Product) => void
  removeFromCompare: (productId: string) => void
  isInCompare: (productId: string) => boolean
  clearCompare: () => void
  
  // Orders
  orders: Order[]
  addOrder: (items: CartItem[], total: number, address?: string, customerData?: { name: string; phone: string; email: string; cedula?: string; notes?: string; paymentMethod?: string }, userEmail?: string) => void
  updateOrderStatus: (orderId: string, status: Order['status']) => void
  getOrderById: (orderId: string) => Order | undefined
  
  // Customer
  customer: Customer
  setCustomer: (customer: Customer) => void
  saveCustomer: () => void
  loadCustomer: () => void
  
  // User (auth)
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  isLoggedIn: boolean
  
  // Reviews
  reviews: Review[]
  addReview: (productId: string, rating: number, comment: string) => void
  getReviewsByProduct: (productId: string) => Review[]
  
  // Coupons
  applyCoupon: (code: string) => { valid: boolean; discount: number; message: string }
  appliedCoupon: Coupon | null
  removeCoupon: () => void
  
  // Newsletter
  subscribed: boolean
  subscribe: (email: string) => void
  unsubscribe: () => void
  
  // Store Settings
  storeSettings: StoreSettings
  updateStoreSettings: (settings: Partial<StoreSettings>) => void
  
  // Notifications
  notifications: Notification[]
  addNotification: (title: string, message: string, type: Notification['type']) => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
  unreadCount: number
  
  // History
  viewedProducts: Product[]
  addToHistory: (product: Product) => void
  clearHistory: () => void
  
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // UI
  showToast: (message: string, type?: 'success' | 'error') => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Productos por defecto
const defaultProducts: Product[] = [
  // Sillas
  { id: 'silla-ely', name: 'Silla Ely', category: 'sillas', price: 299000, originalPrice: 449000, description: 'Diseño elegante y cómodo', rating: 5, reviews: 15, badge: 'Nuevo', stock: 10, features: ['Madera reforzada', 'Asiento acolchado', 'Peso máx: 120kg'], image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=400&fit=crop' },
  { id: 'silla-oslo', name: 'Silla Oslo', category: 'sillas', price: 329000, originalPrice: 399000, description: 'Estilo moderno con asiento acolchado', rating: 4, reviews: 8, stock: 15, features: ['Diseño escandinavo', 'Patas de madera', 'Fácil limpieza'], image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=400&fit=crop' },
  { id: 'silla-aria', name: 'Silla Aria', category: 'sillas', price: 349000, originalPrice: 429000, description: 'Diseño innovador con materiales premium', rating: 5, reviews: 22, badge: 'Popular', stock: 8, features: ['Material premium', 'Respaldo alto', 'Garantía 2 años'], image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=400&h=400&fit=crop' },
  { id: 'silla-maya', name: 'Silla Maya', category: 'sillas', price: 399000, originalPrice: 599000, description: 'Estilo vintage con detalles artesanales', rating: 5, reviews: 12, badge: 'Oferta', discountEndDate: '2026-02-20', stock: 5, features: ['Acabado vintage', 'Detalles artesanales', 'Edición limitada'], image: 'https://images.unsplash.com/photo-1551298370-9d3d5ae1b7b5?w=400&h=400&fit=crop' },
  { id: 'silla-colombina', name: 'Silla Colombina', category: 'sillas', price: 275000, originalPrice: 350000, description: 'Inspirada en tradición colombiana', rating: 4, reviews: 18, stock: 12, features: ['Tejido manual', 'Madera native', 'Respaldo alto'], image: 'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=400&fit=crop' },
  // Mesas
  { id: 'mesa-nova', name: 'Mesa Nova', category: 'mesas', price: 899000, originalPrice: 1199000, description: 'Mesa elegante para 6-8 personas', rating: 5, reviews: 18, badge: 'Más vendido', stock: 6, features: ['Capacidad 8 personas', 'Madera de roble', 'Acabado mate'], image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=400&fit=crop' },
  { id: 'mesa-luna', name: 'Mesa Luna', category: 'mesas', price: 649000, originalPrice: 799000, description: 'Mesa redonda perfecta para espacios pequeños', rating: 4, reviews: 10, stock: 12, features: ['Forma redonda', 'Ideal 4 personas', 'Patas centrales'], image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&h=400&fit=crop' },
  { id: 'mesa-eco', name: 'Mesa Eco', category: 'mesas', price: 749000, originalPrice: 949000, description: 'Diseño minimalista con materiales sostenibles', rating: 5, reviews: 25, badge: 'Eco-Friendly', stock: 7, features: ['Material reciclable', 'Diseño minimalista', 'Certificación verde'], image: 'https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=400&h=400&fit=crop' },
  { id: 'mesa-rustica', name: 'Mesa Rústica', category: 'mesas', price: 1250000, originalPrice: 1599000, description: 'Madera maciza estilo rústico', rating: 5, reviews: 8, badge: 'Nuevo', stock: 4, features: ['Madera teca', 'Patas tornillo', 'Capacidad 10'], image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop' },
  // Taburetes
  { id: 'taburete-bar', name: 'Taburete Bar', category: 'taburetes', price: 189000, originalPrice: 249000, description: 'Perfecto para barras altas', rating: 5, reviews: 30, stock: 20, features: ['Altura regulable', 'Base giratoria', 'Respaldo incluido'], image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop' },
  { id: 'taburete-cocina', name: 'Taburete Cocina', category: 'taburetes', price: 149000, originalPrice: 199000, description: 'Clásico para mostradores', rating: 4, reviews: 15, stock: 25, features: ['Altura estándar', 'Patas madera', 'Antideslizante'], image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop' },
  { id: 'taburete-plegable', name: 'Taburete Plegable', category: 'taburetes', price: 129000, originalPrice: 179000, description: 'Práctico y plegable', rating: 5, reviews: 8, badge: 'Oferta', stock: 30, features: ['Plegable', 'Ligero', 'Fácil almacenamiento'], image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=400&fit=crop' },
  // Aparadores
  { id: 'aparador-rustico', name: 'Aparador Rústico', category: 'aparadores', price: 1250000, originalPrice: 1599000, description: 'Aparador de madera maciza estilo rústico', rating: 5, reviews: 12, badge: 'Nuevo', stock: 4, features: ['Madera de pino', '3 cajones', '2 puertas'], image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop' },
  { id: 'aparador-minimal', name: 'Aparador Minimal', category: 'aparadores', price: 899000, originalPrice: 1199000, description: 'Diseño limpio y moderno', rating: 4, reviews: 8, stock: 6, features: ['Líneas simples', 'Madera claras', 'Espacioso'], image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&h=400&fit=crop' },
  { id: 'aparador-nordico', name: 'Aparador Nórdico', category: 'aparadores', price: 1050000, originalPrice: 1350000, description: 'Estilo nórdico con patas bois', rating: 5, reviews: 6, stock: 5, features: ['Patras bois', 'Puertas vidrio', 'Estante tv'], image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop' },
  // Armarios
  { id: 'armario-closet', name: 'Armario Closet', category: 'armarios', price: 1850000, originalPrice: 2299000, description: 'Amplio armario para closet', rating: 5, reviews: 15, badge: 'Más vendido', stock: 3, features: ['Puertas correderas', 'Interior modular', 'Espejo'], image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=400&fit=crop' },
  { id: 'armario-organizador', name: 'Armario Organizador', category: 'armarios', price: 1450000, originalPrice: 1799000, description: 'Con estantes ajustables', rating: 4, reviews: 10, stock: 5, features: ['6 estantes', 'Puertas battentes', 'Roble'], image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop' },
  // Zapateras
  { id: 'zapatera-industrial', name: 'Zapatera Industrial', category: 'zapateras', price: 345000, originalPrice: 449000, description: 'Diseño industrial con estructura metálica', rating: 5, reviews: 20, stock: 12, features: ['5 niveles', 'Estructura metal', 'Fácil montaje'], image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
  { id: 'zapatera-madera', name: 'Zapatera de Madera', category: 'zapateras', price: 289000, originalPrice: 379000, description: 'Clásica zapatera de madera', rating: 4, reviews: 15, stock: 8, features: ['4 niveles', 'Madera MDF', 'Patas madera'], image: 'https://images.unsplash.com/photo-1605218457336-88c12c8c206b?w=400&h=400&fit=crop' },
  // Repisas
  { id: 'repisa-flotante', name: 'Repisa Flotante', category: 'repisas', price: 89000, originalPrice: 129000, description: 'Minimalista y elegante', rating: 5, reviews: 25, stock: 20, features: ['Sistema flotante', 'Varios tamaños', 'Fácil instalación'], image: 'https://images.unsplash.com/photo-1597072689227-8882273e8f6a?w=400&h=400&fit=crop' },
  { id: 'repisa-esquinera', name: 'Repisa Esquinera', category: 'repisas', price: 145000, originalPrice: 199000, description: 'Aprovecha el espacio esquinero', rating: 4, reviews: 12, stock: 10, features: ['Diseño en L', 'Madera MDF', 'Soporta 10kg'], image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&h=400&fit=crop' },
  // Escritorios
  { id: 'escritorio-oficina', name: 'Escritorio Oficina', category: 'escritorios', price: 650000, originalPrice: 849000, description: 'Ergonómico y profesional', rating: 5, reviews: 18, badge: 'Popular', stock: 7, features: ['Cajón archivador', 'Pasacables', 'Regulable'], image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=400&fit=crop' },
  { id: 'escritoriojuvenil', name: 'Escritorio Juvenil', category: 'escritorios', price: 449000, originalPrice: 599000, description: 'Compacto para habitaciones', rating: 4, reviews: 14, stock: 9, features: ['Compacto', 'Estante libros', 'Color blanco'], image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=400&h=400&fit=crop' },
  
  // Centro Entretenimiento
  { id: 'centro-moderno', name: 'Centro Entretenimiento Moderno', category: 'centro-entretenimiento', price: 1450000, originalPrice: 1899000, description: 'Mueble para TV moderno con almacenamiento', rating: 5, reviews: 12, badge: 'Nuevo', stock: 5, features: ['Para TV hasta 55"', '2 cajones', '2 puertas'], image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop' },
  { id: 'centro-minimal', name: 'Centro Entretenimiento Minimal', category: 'centro-entretenimiento', price: 1190000, originalPrice: 1499000, description: 'Diseño minimalista y elegante', rating: 4, reviews: 8, stock: 6, features: ['Líneas limpias', 'Estante flotante', 'Pasacables'], image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop' },
  { id: 'centro-rustico', name: 'Centro Entretenimiento Rústico', category: 'centro-entretenimiento', price: 1650000, originalPrice: 2199000, description: 'Madera maciza estilo rústico', rating: 5, reviews: 6, badge: 'Premium', stock: 3, features: ['Madera teca', 'Capacidad 65"', 'Baldas abiertas'], image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=400&h=400&fit=crop' },
  { id: 'centro-colgante', name: 'Centro Entretenimiento Colgante', category: 'centro-entretenimiento', price: 890000, originalPrice: 1199000, description: 'Sistema de pared ahorra espacio', rating: 4, reviews: 10, badge: 'Oferta', stock: 8, features: ['Montaje pared', 'Para TV 50"', '3 niveles'], image: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=400&h=400&fit=crop' },
  
  // Mueble Baño
  { id: 'mueble-lavamanos', name: 'Mueble Lavamanos Colgado', category: 'mueble-bano', price: 650000, originalPrice: 849000, description: 'Mueble de baño con lavamanos integrado', rating: 5, reviews: 15, badge: 'Nuevo', stock: 7, features: ['Lavamanos cerámico', '2 cajones', 'Resistente humedad'], image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=400&fit=crop' },
  { id: 'mueble-espejo', name: 'Mueble Baño con Espejo', category: 'mueble-bano', price: 549000, originalPrice: 699000, description: 'Con espejo LED y almacenamiento', rating: 4, reviews: 12, stock: 10, features: ['Espejo LED', '1 cajón', 'Anti-vaho'], image: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=400&h=400&fit=crop' },
  { id: 'mueble-colgante-bano', name: 'Mueble Baño Colgante', category: 'mueble-bano', price: 749000, originalPrice: 949000, description: 'Diseño moderno ahorra espacio', rating: 5, reviews: 8, stock: 6, features: ['Montaje pared', 'Puerta espejo', '2 niveles'], image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=400&fit=crop' },
  { id: 'mueble-juego-bano', name: 'Juego Mueble Baño 3 Piezas', category: 'mueble-bano', price: 1250000, originalPrice: 1599000, description: 'Set completo para baño', rating: 5, reviews: 5, badge: 'Combo', stock: 4, features: ['Mueble principal', 'Espejo', 'Lavamanos'], image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=400&fit=crop' },
]

// Available coupons
const availableCoupons: Coupon[] = [
  { code: 'BIENVENIDO10', discount: 10, type: 'percentage', validUntil: '2026-12-31' },
  { code: 'CREART20', discount: 20, type: 'percentage', minPurchase: 500000, validUntil: '2026-03-31' },
  { code: 'DESCUENTO50', discount: 50000, type: 'fixed', minPurchase: 300000, validUntil: '2026-02-28' },
]

export function AppProvider({ children }: { children: ReactNode }) {
  // State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('creart_cart')
    return saved ? JSON.parse(saved) : []
  })
  
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    const saved = localStorage.getItem('creart_wishlist')
    return saved ? JSON.parse(saved) : []
  })
  
  const [compareList, setCompareList] = useState<Product[]>(() => {
    const saved = localStorage.getItem('creart_compare')
    return saved ? JSON.parse(saved) : []
  })
  
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('creart_orders')
    return saved ? JSON.parse(saved) : []
  })
  
  const [customer, setCustomer] = useState<Customer>(() => {
    const saved = localStorage.getItem('creart_customer')
    return saved ? JSON.parse(saved) : { name: '', phone: '', email: '', address: '' }
  })
  
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('creart_user')
    return saved ? JSON.parse(saved) : null
  })
  
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('creart_reviews')
    return saved ? JSON.parse(saved) : [
      { id: '1', productId: 'silla-ely', userName: 'Carlos M.', rating: 5, comment: 'Excelente calidad, muy cómoda', date: '2026-01-15' },
      { id: '2', productId: 'mesa-nova', userName: 'Ana L.', rating: 5, comment: 'Hermosa mesa, perfecta para nuestra familia', date: '2026-01-20' },
    ]
  })
  
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('creart_notifications')
    return saved ? JSON.parse(saved) : []
  })
  
  const [viewedProducts, setViewedProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('creart_history')
    return saved ? JSON.parse(saved) : []
  })
  
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    const saved = localStorage.getItem('creart_coupon')
    return saved ? JSON.parse(saved) : null
  })
  
  const [subscribed, setSubscribed] = useState<boolean>(() => {
    return localStorage.getItem('creart_subscribed') === 'true'
  })
  
  // Store Settings
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('creart_settings')
    return saved ? JSON.parse(saved) : {
      storeName: 'CREART - Muebles Personalizados',
      slogan: 'Diseño único para tu hogar',
      description: 'Muebles artesanales de alta calidad en Cali, Colombia',
      city: 'Cali',
      address: 'Cali, Valle del Cauca, Colombia',
      phone: '+57 315 993 4696',
      whatsapp: '+57 315 993 4696',
      email: 'muebleriacreat@gmail.com',
      facebook: '',
      instagram: '',
      youtube: '',
      tiktok: '',
      minOrder: 0,
      shippingCost: 0,
      deliveryTime: '3-5 días hábiles',
      paymentWhatsapp: true,
      paymentTransfer: false,
      paymentCash: false,
      returnPolicy: ' Política de devoluciones: Puedes devolver el producto dentro de los 5 días hábiles después de recibirlo, siempre y cuando esté en su estado original.',
      terms: 'Términos y condiciones: Los precios y disponibilidad de productos pueden cambiar sin previo aviso.',
      privacy: 'Política de privacidad: Tus datos personales están seguros con nosotros.',
      categoriesVisibility: {
        sillas: true,
        mesas: true,
        taburetes: true,
        aparadores: true,
        armarios: true,
        zapateras: true,
        repisas: true,
        escritorios: true,
        'centro-entretenimiento': true,
        'mueble-bano': true,
      },
    }
  })
  
  const updateStoreSettings = (updates: Partial<StoreSettings>) => {
    setStoreSettings(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem('creart_settings', JSON.stringify(updated))
      return updated
    })
  }
  
  const [searchQuery, setSearchQuery] = useState('')

  // Products state (with CRUD)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('creart_products')
    return saved ? JSON.parse(saved) : defaultProducts
  })

  // Product CRUD functions
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: `product-${Date.now()}` }
    setProducts(prev => {
      const updated = [...prev, newProduct]
      localStorage.setItem('creart_products', JSON.stringify(updated))
      return updated
    })
    showToast(`${product.name} agregado`, 'success')
  }

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p)
      localStorage.setItem('creart_products', JSON.stringify(updated))
      return updated
    })
    showToast('Producto actualizado', 'success')
  }

  const deleteProduct = (id: string) => {
    const product = products.find(p => p.id === id)
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== id)
      localStorage.setItem('creart_products', JSON.stringify(updated))
      return updated
    })
    showToast(`${product?.name} eliminado`, 'success')
  }

  // Persist to localStorage
  useEffect(() => localStorage.setItem('creart_cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('creart_wishlist', JSON.stringify(wishlist)), [wishlist])
  useEffect(() => localStorage.setItem('creart_compare', JSON.stringify(compareList)), [compareList])
  useEffect(() => localStorage.setItem('creart_orders', JSON.stringify(orders)), [orders])
  useEffect(() => localStorage.setItem('creart_reviews', JSON.stringify(reviews)), [reviews])
  useEffect(() => localStorage.setItem('creart_notifications', JSON.stringify(notifications)), [notifications])
  useEffect(() => localStorage.setItem('creart_history', JSON.stringify(viewedProducts)), [viewedProducts])
  useEffect(() => localStorage.setItem('creart_coupon', JSON.stringify(appliedCoupon)), [appliedCoupon])
  useEffect(() => user ? localStorage.setItem('creart_user', JSON.stringify(user)) : localStorage.removeItem('creart_user'), [user])

  // Cart functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
    showToast(`${product.name} agregado al carrito`, 'success')
  }

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.id !== productId))

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity } : item))
  }

  const clearCart = () => setCart([])

  // Wishlist functions
  const toggleWishlist = (product: Product) => {
    setWishlist(prev => prev.find(p => p.id === product.id) 
      ? prev.filter(p => p.id !== product.id)
      : [...prev, product]
    )
  }

  const isInWishlist = (productId: string) => wishlist.some(p => p.id === productId)

  // Compare functions
  const addToCompare = (product: Product) => {
    if (compareList.length >= 4) {
      showToast('Máximo 4 productos para comparar', 'error')
      return
    }
    if (compareList.find(p => p.id === product.id)) {
      showToast('Producto ya en lista de comparación', 'error')
      return
    }
    setCompareList(prev => [...prev, product])
    showToast(`${product.name} agregado a comparar`, 'success')
  }

  const removeFromCompare = (productId: string) => setCompareList(prev => prev.filter(p => p.id !== productId))
  const isInCompare = (productId: string) => compareList.some(p => p.id === productId)
  const clearCompare = () => setCompareList([])

  // Orders functions
  const addOrder = (items: CartItem[], total: number, address?: string, customerData?: { name: string; phone: string; email: string; cedula?: string; notes?: string; paymentMethod?: string }, userEmail?: string) => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      date: new Date().toLocaleDateString('es-CO'),
      items,
      total,
      status: 'pending',
      shippingAddress: address || customer.address,
      customerName: customerData?.name || customer.name,
      customerPhone: customerData?.phone || customer.phone,
      customerEmail: customerData?.email || customer.email || userEmail || '',
      customerCedula: customerData?.cedula,
      customerNotes: customerData?.notes,
      paymentMethod: customerData?.paymentMethod,
    }
    setOrders(prev => [newOrder, ...prev])
    setCart([])
    addNotification('Pedido confirmado', `Tu pedido ${newOrder.id} ha sido recibido`, 'success')
    showToast('Pedido realizado con éxito', 'success')
  }

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    // Buscar el pedido
    const order = orders.find(o => o.id === orderId)
    if (!order) return

    // Si el pedido se completa, descontar el stock de los productos
    if (status === 'completed' && order.status !== 'completed') {
      setProducts(prev => {
        const updated = prev.map(product => {
          const orderItem = order.items.find(item => item.id === product.id)
          if (orderItem) {
            const newStock = (product.stock || 0) - orderItem.quantity
            return { ...product, stock: Math.max(0, newStock) }
          }
          return product
        })
        // Guardar en localStorage
        localStorage.setItem('creart_products', JSON.stringify(updated))
        return updated
      })
    }

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))
  }

  const getOrderById = (orderId: string) => orders.find(o => o.id === orderId)

  // Customer functions
  const saveCustomer = () => localStorage.setItem('creart_customer', JSON.stringify(customer))
  const loadCustomer = () => {
    const saved = localStorage.getItem('creart_customer')
    if (saved) setCustomer(JSON.parse(saved))
  }

  // Reviews functions
  const addReview = (productId: string, rating: number, comment: string, userName?: string) => {
    const newReview: Review = {
      id: Date.now().toString(),
      productId,
      userName: userName || 'Usuario',
      rating,
      comment,
      date: new Date().toLocaleDateString('es-CO'),
    }
    setReviews(prev => [newReview, ...prev])
    showToast('Reseña publicada', 'success')
  }

  const getReviewsByProduct = (productId: string) => reviews.filter(r => r.productId === productId)

  // Coupon functions
  const applyCoupon = (code: string): { valid: boolean; discount: number; message: string } => {
    const coupon = availableCoupons.find(c => c.code.toUpperCase() === code.toUpperCase())
    if (!coupon) return { valid: false, discount: 0, message: 'Cupón no válido' }
    if (cartSubtotal < (coupon.minPurchase || 0)) {
      return { valid: false, discount: 0, message: `Compra mínima de $${(coupon.minPurchase || 0).toLocaleString('es-CO')}` }
    }
    setAppliedCoupon(coupon)
    return { 
      valid: true, 
      discount: coupon.type === 'percentage' ? Math.round(cartSubtotal * coupon.discount / 100) : coupon.discount,
      message: `¡Cupón aplicado! -${coupon.type === 'percentage' ? coupon.discount + '%' : '$' + coupon.discount.toLocaleString('es-CO')}`
    }
  }

  const removeCoupon = () => setAppliedCoupon(null)

  // Newsletter functions
  const subscribe = (email: string) => {
    setSubscribed(true)
    localStorage.setItem('creart_subscribed', 'true')
    addNotification('Suscripción exitosa', `Te has suscrito con ${email}`, 'success')
    showToast('¡Te has suscrito a nuestro newsletter!', 'success')
  }

  const unsubscribe = () => {
    setSubscribed(false)
    localStorage.setItem('creart_subscribed', 'false')
  }

  // Notification functions
  const addNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = { id: Date.now().toString(), title, message, type, read: false, date: new Date().toISOString() }
    setNotifications(prev => [newNotif, ...prev].slice(0, 20))
  }

  const markNotificationRead = (id: string) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  const clearNotifications = () => setNotifications([])
  const unreadCount = notifications.filter(n => !n.read).length

  // History functions
  const addToHistory = (product: Product) => {
    setViewedProducts(prev => {
      const filtered = prev.filter(p => p.id !== product.id)
      return [product, ...filtered].slice(0, 20)
    })
  }

  const clearHistory = () => setViewedProducts([])

  // Product search
  const searchProducts = (query: string) => {
    if (!query) return []
    const q = query.toLowerCase()
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    )
  }

  const getProductById = (id: string) => products.find(p => p.id === id)
  const getRelatedProducts = (productId: string) => {
    const product = getProductById(productId)
    if (!product) return []
    return products.filter(p => p.category === product.category && p.id !== productId).slice(0, 4)
  }

  // Toast function
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    const toast = document.getElementById('toast')
    if (toast) {
      toast.textContent = message
      toast.className = `toast ${type} show`
      setTimeout(() => toast.className = 'toast', 3000)
    }
  }

  // Computed values
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  let discount = appliedCoupon 
    ? (appliedCoupon.type === 'percentage' ? Math.round(cartSubtotal * appliedCoupon.discount / 100) : appliedCoupon.discount)
    : 0
  const cartIVA = Math.round((cartSubtotal - discount) * 0.19)
  const cartTotal = cartSubtotal - discount + cartIVA

  const getProductsByCategory = (category: string) => products.filter(p => p.category === category)

  const value: AppContextType = {
    products: products,
    getProductsByCategory,
    searchProducts,
    getProductById,
    getRelatedProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartSubtotal, cartIVA, cartTotal,
    wishlist, toggleWishlist, isInWishlist, wishlistCount: wishlist.length,
    compareList, addToCompare, removeFromCompare, isInCompare, clearCompare,
    orders, addOrder, updateOrderStatus, getOrderById,
    customer, setCustomer, saveCustomer, loadCustomer,
    user, setUser, logout: () => { setUser(null); localStorage.removeItem('creart_user') }, isLoggedIn: !!user,
    reviews, addReview, getReviewsByProduct,
    applyCoupon, appliedCoupon, removeCoupon,
    subscribed, subscribe, unsubscribe,
    notifications, addNotification, markNotificationRead, clearNotifications, unreadCount,
    viewedProducts, addToHistory, clearHistory,
    searchQuery, setSearchQuery,
    showToast,
    storeSettings,
    updateStoreSettings,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) throw new Error('useApp must be used within AppProvider')
  return context
}
