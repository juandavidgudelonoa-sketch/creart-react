import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router'
  import { 
  Package, ShoppingCart, TrendingUp, Settings, Plus, Edit, Trash2, 
  Shield, X, CheckCircle, AlertTriangle, Users, DollarSign, FileText,
  Home, LayoutGrid, CreditCard, Bell, Search, Filter, Grid, List,
  ChevronRight, PackagePlus, Eye, MoreVertical, Save, TrendingDown,
  ArrowUpRight, ArrowDownRight, BarChart3, Activity, Clock, CheckSquare,
  XCircle, Truck, PackageCheck, XSquare, Star, Download, Mail, FileSpreadsheet, Upload,
  Bot
} from 'lucide-react'
import { useApp, Product, Order } from '../context/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where
} from 'firebase/firestore'
import { db } from '../firebase'
import AIAssistant from '../components/AIAssistant'

// Tipo para categorías
interface Category {
  id: string
  name: string
  icon: string
  color: string
  image: string
}

// Default image URLs by category
const defaultImages: Record<string, string> = {
  sillas: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
  mesas: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop',
  taburetes: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&h=300&fit=crop',
  aparadores: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
  armarios: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop',
  zapateras: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
  repisas: 'https://images.unsplash.com/photo-1597072689227-8882273e8f6a?w=400&h=300&fit=crop',
  escritorios: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
}

// Lista de iconos
const iconOptions = [
  'fa-chair', 'fa-couch', 'fa-bed', 'fa-table', 'fa-archive',
  'fa-box', 'fa-boxes', 'fa-dungeon', 'fa-door-closed', 'fa-door-open',
  'fa-layer-group', 'fa-store', 'fa-store-alt', 'fa-warehouse',
  'fa-grip-lines', 'fa-grip-vertical', 'fa-ruler', 'fa-pencil-ruler',
  'fa-screwdriver', 'fa-hammer', 'fa-tools', 'fa-paint-brush',
  'fa-paint-roller', 'fa-laptop', 'fa-desktop', 'fa-mobile-alt',
  'fa-cube', 'fa-cubes', 'fa-shapes', 'fa-square', 'fa-th-large',
  'fa-th', 'fa-th-list', 'fa-border-all',
  'fa-shoe-prints', 'fa-tshirt', 'fa-user', 'fa-users',
  'fa-child', 'fa-baby', 'fa-tree', 'fa-leaf', 'fa-seedling',
  'fa-truck', 'fa-shipping-fast', 'fa-shopping-bag', 'fa-shopping-cart',
  'fa-star', 'fa-heart', 'fa-gem', 'fa-gift',
  'fa-fire', 'fa-lightbulb', 'fa-sun', 'fa-moon'
]

export default function AdminPage() {
  const { orders, products, addProduct, updateProduct, deleteProduct, updateOrderStatus, storeSettings, updateStoreSettings, showToast } = useApp()
  const { user: authUser, isAdmin: isUserAdmin } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [activeSettingsTab, setActiveSettingsTab] = useState('company')
  const [showModal, setShowModal] = useState(false)
  
  // Estado para pedidos desde Firestore (MercadoPago)
  const [firestoreOrders, setFirestoreOrders] = useState<any[]>([])
  const [loadingFirestoreOrders, setLoadingFirestoreOrders] = useState(false)
  
  // Combinar pedidos de localStorage y Firestore
  const allOrders = useMemo(() => {
    return [...orders, ...firestoreOrders.filter(fo => !orders.find(o => o.id === fo.id))]
  }, [orders, firestoreOrders])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('fa-box')
  const [newCategoryImage, setNewCategoryImage] = useState('')
  
  // Estado de categorías
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('creart_categories')
    return saved ? JSON.parse(saved) : [
      { id: 'sillas', name: 'Sillas', icon: 'fa-chair', color: 'text-teal-600', image: '' },
      { id: 'mesas', name: 'Mesas', icon: 'fa-table', color: 'text-orange-500', image: '' },
      { id: 'taburetes', name: 'Taburetes', icon: 'fa-square', color: 'text-green-600', image: '' },
      { id: 'aparadores', name: 'Aparadores', icon: 'fa-dungeon', color: 'text-blue-600', image: '' },
      { id: 'armarios', name: 'Armarios', icon: 'fa-door-closed', color: 'text-purple-600', image: '' },
      { id: 'zapateras', name: 'Zapateras', icon: 'fa-shoe-prints', color: 'text-amber-600', image: '' },
      { id: 'repisas', name: 'Repisas', icon: 'fa-grip-lines', color: 'text-gray-600', image: '' },
      { id: 'escritorios', name: 'Escritorios', icon: 'fa-laptop', color: 'text-indigo-600', image: '' },
    ]
  })
  
  // Filtros de pedidos
  const [orderFilter, setOrderFilter] = useState('all')
  const [orderSearch, setOrderSearch] = useState('')
  const [ordersPage, setOrdersPage] = useState(1)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const ordersPerPage = 10
  
  // Filtros de productos
  const [productFilter, setProductFilter] = useState('all')
  const [productSearch, setProductSearch] = useState('')
  const [productView, setProductView] = useState<'grid' | 'list'>('grid')
  
  // Estado para notas de pedidos
  const [orderNotes, setOrderNotes] = useState<Record<string, string>>({})
  const [editingNote, setEditingNote] = useState<string | null>(null)
  
  // Estado para moderación de reseñas
  const [reviewFilter, setReviewFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [reviewSearch, setReviewSearch] = useState('')
  
  // Estado para nuevas secciones del Dashboard
  const [reviews, setReviews] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Cargar reseñas y clientes desde Firestore
  useEffect(() => {
    const loadDashboardData = async () => {
      if (activeSection !== 'dashboard') {
        setLoadingData(false)
        return
      }
      
      try {
        setLoadingData(true)
        
        // Cargar reseñas
        const reviewsQuery = query(
          collection(db, 'reviews'),
          orderBy('createdAt', 'desc'),
          limit(20)
        )
        const reviewsSnapshot = await getDocs(reviewsQuery)
        const reviewsData = reviewsSnapshot.docs.map(doc => {
          const data = doc.data()
          // Convertir timestamp de Firestore a fecha legible
          let dateStr = data.date || ''
          if (data.createdAt && typeof data.createdAt === 'object' && 'seconds' in data.createdAt) {
            dateStr = new Date(data.createdAt.seconds * 1000).toLocaleDateString('es-CO')
          } else if (!dateStr) {
            dateStr = new Date().toLocaleDateString('es-CO')
          }
          return {
            id: doc.id,
            ...data,
            date: dateStr
          }
        })
        setReviews(reviewsData)
        
        // Cargar clientes
        const customersQuery = query(
          collection(db, 'customers'),
          orderBy('createdAt', 'desc'),
          limit(10)
        )
        const customersSnapshot = await getDocs(customersQuery)
        const customersData = customersSnapshot.docs.map(doc => {
          const data = doc.data()
          // Convertir timestamp de Firestore a fecha legible
          let createdAtStr = 'Reciente'
          if (data.createdAt && typeof data.createdAt === 'object' && 'seconds' in data.createdAt) {
            createdAtStr = new Date(data.createdAt.seconds * 1000).toLocaleDateString('es-CO')
          }
          return {
            id: doc.id,
            ...data,
            createdAt: createdAtStr
          }
        })
        setCustomers(customersData)
        
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoadingData(false)
      }
    }
    
    loadDashboardData()
  }, [activeSection])
  
  // Cargar pedidos desde Firestore (MercadoPago)
  useEffect(() => {
    const loadFirestoreOrders = async () => {
      setLoadingFirestoreOrders(true)
      try {
        const ordersQuery = query(
          collection(db, 'orders'),
          orderBy('createdAt', 'desc')
        )
        const ordersSnapshot = await getDocs(ordersQuery)
        const ordersData = ordersSnapshot.docs.map(doc => {
          const data = doc.data()
          let dateStr = ''
          let timeStr = ''
          if (data.createdAt && typeof data.createdAt === 'object' && 'seconds' in data.createdAt) {
            const dateObj = new Date(data.createdAt.seconds * 1000)
            dateStr = dateObj.toLocaleDateString('es-CO')
            timeStr = dateObj.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
          }
          return {
            id: doc.id,
            ...data,
            date: dateStr || new Date().toLocaleDateString('es-CO'),
            time: timeStr || ''
          }
        })
        setFirestoreOrders(ordersData)
        console.log('Pedidos cargados desde Firestore:', ordersData.length)
      } catch (error) {
        console.error('Error loading Firestore orders:', error)
      } finally {
        setLoadingFirestoreOrders(false)
      }
    }
    
    loadFirestoreOrders()
  }, [])

  // Variables calculadas para las nuevas secciones
  const totalReviews = reviews.length
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
    return sum / reviews.length
  }, [reviews])
  
  const recentReviews = reviews.slice(0, 5)
  
  const recentCustomers = customers.slice(0, 5)

  // Datos para el gráfico de ventas semanal
  const weeklySalesData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const today = new Date()
    const data = []
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      // Sumar pedidos de ese día
      const dayOrders = allOrders.filter(order => {
        const orderDate = order.date?.split('T')[0] || order.date
        return orderDate === dateStr
      })
      
      const amount = dayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
      data.push({
        label: days[date.getDay()],
        amount,
        date: dateStr
      })
    }
    
    // Calcular porcentaje para la altura de las barras
    const maxAmount = Math.max(...data.map(d => d.amount), 1)
    return data.map(d => ({
      ...d,
      percentage: Math.max((d.amount / maxAmount) * 100, 5)
    }))
  }, [allOrders])

  const weeklyRevenue = weeklySalesData.reduce((sum, d) => sum + d.amount, 0)
  
  // Función para ir a productos con stock bajo
  const goToLowStockProducts = () => {
    setProductFilter('low')
    setActiveSection('products')
  }
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0]?.id || 'sillas',
    price: 0,
    originalPrice: 0,
    description: '',
    stock: 0,
    badge: '',
    image: '',
    images: [] as string[], // Múltiples imágenes
    featured: false,
    features: '',
    // Nuevos campos
    material: '',
    dimensions: { width: 0, height: 0, depth: 0 },
    weight: 0,
    sku: '',
    active: true,
    lowStockAlert: 5,
  })

  const isAdmin = isUserAdmin || authUser?.email === 'juandavidgudelonoa@gmail.com'

  // También verificar por email hardcodeado para mayor seguridad
  const isRealAdmin = authUser?.email === 'juandavidgudelonoa@gmail.com' || isUserAdmin

  // Si no está logueado, mostrar mensaje de acceso denegado
  if (!authUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <Shield className="w-20 h-20 mx-auto text-red-500 mb-6" />
          <h2 className="text-2xl font-bold mb-3">Debes iniciar sesión</h2>
          <p className="text-gray-500 mb-8">Necesitas estar autenticado para acceder al panel de administrador.</p>
          <Link to="/login" className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-8 rounded-full font-semibold hover:from-teal-600 hover:to-teal-700 transition-all">
            Ir a Login
          </Link>
        </div>
      </div>
    )
  }

  if (!isRealAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <Shield className="w-20 h-20 mx-auto text-red-500 mb-6" />
          <h2 className="text-2xl font-bold mb-3">Acceso Denegado</h2>
          <p className="text-gray-500 mb-8">No tienes permisos de administrador para acceder a esta página.</p>
          <Link to="/login" className="inline-block bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 px-8 rounded-full font-semibold hover:from-teal-600 hover:to-teal-700 transition-all">
            Ir a Login
          </Link>
        </div>
      </div>
    )
  }

  // Métricas calculadas
  const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const totalOrders = allOrders.length
  const pendingOrders = allOrders.filter(o => o.status === 'pending' || o.paymentStatus === 'pending').length
  const completedOrders = allOrders.filter(o => o.status === 'completed' || o.paymentStatus === 'approved').length
  const lowStockProducts = products.filter(p => p.stock && p.stock < 5).length
  const outOfStock = products.filter(p => !p.stock || p.stock === 0).length
  
  // Productos más vendidos
  const productSales: Record<string, number> = {}
  allOrders.forEach((order: any) => {
    (order.items || []).forEach((item: any) => {
      productSales[item.id] = (productSales[item.id] || 0) + item.quantity
    })
  })
  const topProducts = Object.entries(productSales)
    .map(([id, qty]) => ({ id, quantity: qty, product: products.find(p => p.id === id) }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)

  // Ingresos del mes actual
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const monthlyRevenue = orders
    .filter(o => {
      const orderDate = new Date(o.date)
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear
    })
    .reduce((sum, o) => sum + o.total, 0)

  // Clientes únicos
  const uniqueCustomers = new Set(allOrders.map(o => o.customer?.email || o.customerEmail).filter(Boolean)).size

  // Pedidos de hoy
  const today = new Date().toLocaleDateString('es-CO')
  const todayOrders = allOrders.filter(o => o.date === today).length

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart, badge: pendingOrders > 0 ? pendingOrders : null },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'reviews', label: 'Reseñas', icon: Star, badge: reviews.filter(r => !r.approved).length > 0 ? reviews.filter(r => !r.approved).length : null },
    { id: 'settings', label: 'Configuración', icon: Settings },
    { id: 'aiassistant', label: 'Asistente IA', icon: Bot },
  ]

  // Settings tabs
  const settingsTabs = [
    { id: 'company', label: 'Empresa', icon: Users },
    { id: 'social', label: 'Redes Sociales', icon: Bell },
    { id: 'orders', label: 'Pedidos', icon: Package },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'policies', label: 'Políticas', icon: FileText },
  ]

  // Open modal for new product
  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      category: categories[0]?.id || '',
      price: 0,
      originalPrice: 0,
      description: '',
      stock: 0,
      badge: '',
      image: '',
      images: [],
      featured: false,
      features: '',
      material: '',
      dimensions: { width: 0, height: 0, depth: 0 },
      weight: 0,
      sku: '',
      active: true,
      lowStockAlert: 5,
    })
    setShowModal(true)
  }

  // Open modal for edit product
  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      originalPrice: product.originalPrice || 0,
      description: product.description,
      stock: product.stock || 0,
      badge: product.badge || '',
      image: product.image || '',
      images: (product as any).images || [],
      featured: product.featured || false,
      features: product.features?.join('\n') || '',
      material: (product as any).material || '',
      dimensions: (product as any).dimensions || { width: 0, height: 0, depth: 0 },
      weight: (product as any).weight || 0,
      sku: (product as any).sku || '',
      active: (product as any).active !== false,
      lowStockAlert: (product as any).lowStockAlert || 5,
    })
    setShowModal(true)
  }

  // Save product
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    const productData = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      originalPrice: formData.originalPrice > 0 ? formData.originalPrice : undefined,
      description: formData.description,
      stock: formData.stock,
      badge: formData.badge || undefined,
      image: formData.image || defaultImages[formData.category],
      images: formData.images.length > 0 ? formData.images : [formData.image || defaultImages[formData.category]],
      rating: editingProduct?.rating || 4,
      reviews: editingProduct?.reviews || 0,
      features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
      featured: formData.featured,
      // Nuevos campos
      material: formData.material || undefined,
      dimensions: formData.dimensions.width > 0 || formData.dimensions.height > 0 || formData.dimensions.depth > 0 ? formData.dimensions : undefined,
      weight: formData.weight > 0 ? formData.weight : undefined,
      sku: formData.sku || undefined,
      active: formData.active,
      lowStockAlert: formData.lowStockAlert,
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, productData)
      showToast('Producto actualizado', 'success')
    } else {
      addProduct(productData)
      showToast('Producto agregado', 'success')
    }
    
    setShowModal(false)
  }

  // Delete product
  const handleDelete = (id: string) => {
    deleteProduct(id)
    setShowDeleteConfirm(null)
    showToast('Producto eliminado', 'success')
  }

  // Guardar settings
  const handleSaveSettings = () => {
    showToast('Configuración guardada', 'success')
  }

  // Exportar pedidos a CSV
  const exportOrdersToCSV = () => {
    const headers = ['ID', 'Fecha', 'Cliente', 'Email', 'Teléfono', 'Cédula/NIT', 'Dirección', 'Notas', 'Método de Pago', 'Estado', 'Total', 'Productos']
    const rows = allOrders.map(order => [
      order.id,
      order.date,
      order.customer?.name || order.customerName || '',
      order.customer?.email || order.customerEmail || '',
      order.customer?.phone || order.customerPhone || '',
      order.customer?.cedula || (order as any).customerCedula || '',
      order.customer?.address || order.shippingAddress || '',
      order.customer?.notes || (order as any).customerNotes || '',
      (order as any).paymentMethod || 'MercadoPago',
      order.status || order.paymentStatus || 'pending',
      (order.total || 0).toString(),
      (order.items || []).map((item: any) => `${item.name || item.title} x${item.quantity}`).join('; ')
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showToast('Pedidos exportados exitosamente', 'success')
  }

  // Guardar nota de pedido
  const saveOrderNote = (orderId: string) => {
    const note = orderNotes[orderId] || ''
    // Aquí podrías guardar en Firestore si lo necesitas
    console.log(`Nota guardada para pedido ${orderId}:`, note)
    setEditingNote(null)
    showToast('Nota guardada', 'success')
  }

  // Obtener historial de cambios de estado
  const getOrderStatusHistory = (order: Order) => {
    const statusHistory = []
    // simulamos el historial basado en el estado actual
    statusHistory.push({
      status: order.status,
      date: order.date,
      note: orderNotes[order.id] || ''
    })
    return statusHistory
  }

  // Obtener nombre del estado en español
  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      processing: 'Procesando',
      shipped: 'Enviado',
      completed: 'Completado',
      cancelled: 'Cancelado'
    }
    return labels[status] || status
  }

  // Funciones de moderación de reseñas
  const approveReview = (reviewId: string) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, approved: true } : r
    ))
    showToast('Reseña aprobada', 'success')
  }

  const deleteReview = (reviewId: string) => {
    if (confirm('¿Estás seguro de eliminar esta reseña?')) {
      setReviews(reviews.filter(r => r.id !== reviewId))
      showToast('Reseña eliminada', 'success')
    }
  }

  const pendingReviewsCount = reviews.filter(r => !r.approved).length

  // Exportar productos a CSV
  const exportProductsToCSV = () => {
    const headers = ['Nombre', 'Categoría', 'Precio', 'Precio Original', 'Stock', 'SKU', 'Material', 'Badge', 'Activo', 'Descripción']
    const rows = products.map(product => [
      product.name,
      product.category,
      product.price.toString(),
      (product.originalPrice || '').toString(),
      (product.stock || 0).toString(),
      (product as any).sku || '',
      (product as any).material || '',
      product.badge || '',
      (product as any).active !== false ? 'Sí' : 'No',
      product.description || ''
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
    ].join('\n')
    
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `productos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showToast('Productos exportados exitosamente', 'success')
  }

  // Descargar plantilla CSV
  const downloadProductTemplate = () => {
    const headers = ['Nombre', 'Categoría', 'Precio', 'Precio Original', 'Stock', 'SKU', 'Material', 'Badge', 'Activo', 'Descripción']
    const exampleRow = ['Ejemplo de Producto', 'sillas', '150000', '200000', '10', 'SKU-001', 'Madera Oak', 'Nuevo', 'Sí', 'Descripción del producto']
    
    const csvContent = [
      headers.join(','),
      exampleRow.map(cell => `"${cell}"`).join(',')
    ].join('\n')
    
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'plantilla_productos.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showToast('Plantilla descargada', 'success')
  }

  // Importar productos desde CSV
  const importProductsFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const lines = text.split('\n').filter(line => line.trim())
        
        // Saltar header
        const dataLines = lines.slice(1)
        
        let importedCount = 0
        dataLines.forEach(line => {
          // Parsear CSV manualmente
          const values: string[] = []
          let current = ''
          let inQuotes = false
          
          for (const char of line) {
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
              values.push(current.trim())
              current = ''
            } else {
              current += char
            }
          }
          values.push(current.trim())
          
          // Crear producto
          if (values[0] && values[2]) { // Nombre y precio requeridos
            const newProduct = {
              name: values[0],
              category: values[1] || 'sillas',
              price: Number(values[2]) || 0,
              originalPrice: values[3] ? Number(values[3]) : undefined,
              stock: Number(values[4]) || 0,
              sku: values[5] || undefined,
              material: values[6] || undefined,
              badge: values[7] || undefined,
              active: values[8]?.toLowerCase() !== 'no',
              description: values[9] || '',
              image: defaultImages[values[1]] || '',
              rating: 4,
              reviews: 0,
              featured: false,
              features: []
            }
            
            addProduct(newProduct)
            importedCount++
          }
        })
        
        showToast(`${importedCount} productos importados`, 'success')
      } catch (error) {
        console.error('Error importing:', error)
        showToast('Error al importar productos', 'error')
      }
    }
    reader.readAsText(file)
    
    // Reset input
    event.target.value = ''
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="font-bold text-gray-800">CREART</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg">
            <LayoutGrid className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === item.id 
                  ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-200' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && (
                <>
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">A</span>
            </div>
            {sidebarOpen && (
              <div>
                <p className="font-medium text-gray-800">{(authUser as any)?.displayName || authUser?.email?.split('@')[0] || 'Admin'}</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">
              {navItems.find(n => n.id === activeSection)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => window.location.href = '/'} className="p-2 hover:bg-gray-100 rounded-lg text-gray-600">
              <Home className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="p-6">
          {/* DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards - Métricas Mejoradas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Pedidos Totales */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                      <ShoppingCart className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${todayOrders > 0 ? 'text-green-500' : 'text-gray-400'}`}>
                      {todayOrders > 0 ? <ArrowUpRight className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                      <span>{todayOrders} hoy</span>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{totalOrders}</p>
                  <p className="text-gray-500 text-sm">Pedidos Totales</p>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: `${Math.min(100, (totalOrders / 50) * 100)}%` }} />
                  </div>
                </div>

                {/* Pedidos Pendientes */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-200">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${pendingOrders > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {pendingOrders > 0 ? `${pendingOrders} pendientes` : 'Sin pendientes'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{pendingOrders}</p>
                  <p className="text-gray-500 text-sm">Pedidos Pendientes</p>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${pendingOrders > 5 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gradient-to-r from-green-400 to-green-600'}`} style={{ width: `${Math.min(100, (pendingOrders / 20) * 100)}%` }} />
                  </div>
                </div>

                {/* Completados */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-green-600 text-sm font-medium">{totalOrders > 0 ? Math.round((completedOrders/totalOrders)*100) : 0}%</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{completedOrders}</p>
                  <p className="text-gray-500 text-sm">Completados</p>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-600 rounded-full" style={{ width: `${totalOrders > 0 ? (completedOrders/totalOrders)*100 : 0}%` }} />
                  </div>
                </div>

                {/* Productos */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <span className={`text-sm font-medium ${lowStockProducts > 0 ? 'text-red-500' : 'text-green-500'}`}>
                      {lowStockProducts > 0 ? `${lowStockProducts} bajo stock` : 'Stock OK'}
                    </span>
                  </div>
                  <p className="text-3xl font-bold text-gray-800">{products.length}</p>
                  <p className="text-gray-500 text-sm">Productos</p>
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${lowStockProducts > 0 ? 'bg-gradient-to-r from-red-400 to-red-600' : 'bg-gradient-to-r from-purple-400 to-purple-600'}`} style={{ width: `${Math.min(100, (products.length / 100) * 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Revenue Cards - Mejorados */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <p className="text-teal-100 text-sm mb-1">Ingresos Totales</p>
                    <p className="text-3xl font-bold">{formatPrice(totalRevenue)}</p>
                    <div className="mt-3 flex items-center gap-1 text-teal-200 text-sm">
                      <BarChart3 className="w-4 h-4" />
                      <span>Histórico completo</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <p className="text-blue-100 text-sm mb-1">Este Mes</p>
                    <p className="text-3xl font-bold">{formatPrice(monthlyRevenue)}</p>
                    <div className="mt-3 flex items-center gap-1 text-blue-200 text-sm">
                      <Activity className="w-4 h-4" />
                      <span>{new Date().toLocaleString('es-CO', { month: 'long' })}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                  <div className="relative">
                    <p className="text-purple-100 text-sm mb-1">Clientes Únicos</p>
                    <p className="text-3xl font-bold">{uniqueCustomers}</p>
                    <div className="mt-3 flex items-center gap-1 text-purple-200 text-sm">
                      <Users className="w-4 h-4" />
                      <span>Registrados</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Low Stock Alert */}
              {lowStockProducts > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-red-100 transition" onClick={goToLowStockProducts}>
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-700">Alerta de Stock</p>
                    <p className="text-red-600">{lowStockProducts} producto(s) con stock bajo (menos de 5 unidades)</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); goToLowStockProducts(); }} className="ml-auto bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
                    Ver Productos
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Últimos Pedidos</h3>
                    <button onClick={() => setActiveSection('orders')} className="text-teal-600 text-sm font-medium hover:underline">
                      Ver todos
                    </button>
                  </div>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map(order => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            order.status === 'completed' ? 'bg-green-500' :
                            order.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-800">{(order as any).id || order.id}</p>
                            <p className="text-xs text-gray-500">{order.date} {((order as any).time) && `a las ${(order as any).time}`}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">{formatPrice(order.total)}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.status === 'completed' ? 'bg-green-100 text-green-700' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {allOrders.length === 0 && !loadingFirestoreOrders && <p className="text-gray-500 text-center py-4">No hay pedidos</p>}
                    {loadingFirestoreOrders && <p className="text-gray-500 text-center py-4">Cargando pedidos...</p>}
                  </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h3 className="font-bold text-gray-800 mb-4">Productos Más Vendidos</h3>
                  <div className="space-y-3">
                    {topProducts.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                          {item.product?.image && <img src={item.product.image} alt="" className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800 text-sm">{item.product?.name || 'Producto'}</p>
                          <p className="text-xs text-gray-500">{item.quantity} ventas</p>
                        </div>
                        <p className="font-bold text-teal-600">{formatPrice(item.product?.price || 0)}</p>
                      </div>
                    ))}
                    {topProducts.length === 0 && <p className="text-gray-500 text-center py-4">Sin datos</p>}
                  </div>
                </div>
              </div>

              {/* NUEVAS SECCIONES: Reseñas, Ventas Semanal, Clientes Recientes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Reseñas - Rating y Últimas */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Reseñas</h3>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="font-bold text-gray-800">{averageRating > 0 ? averageRating.toFixed(1) : '0.0'}</span>
                      <span className="text-gray-500 text-sm">({totalReviews} reseñas)</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {recentReviews.length > 0 ? recentReviews.slice(0, 5).map(review => (
                      <div key={review.id} className="p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800">{review.userName}</span>
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{review.comment}</p>
                        <p className="text-xs text-gray-400 mt-1">{review.date}</p>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-center py-4">No hay reseñas aún</p>
                    )}
                  </div>
                </div>

                {/* Clientes Recientes */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800">Clientes Nuevos</h3>
                    <span className="text-gray-500 text-sm">{recentCustomers.length} este mes</span>
                  </div>
                  <div className="space-y-3">
                    {recentCustomers.length > 0 ? recentCustomers.map(customer => (
                      <div key={customer.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                          {customer.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{customer.name || 'Sin nombre'}</p>
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        </div>
                        <span className="text-xs text-gray-400">{customer.createdAt || 'Reciente'}</span>
                      </div>
                    )) : (
                      <p className="text-gray-500 text-center py-4">No hay clientes nuevos</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Gráfico de Ventas Semanal */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-800">Ventas esta Semana</h3>
                  <span className="text-teal-600 font-medium">{formatPrice(weeklyRevenue)} total</span>
                </div>
                <div className="flex items-end justify-between gap-2 h-40">
                  {weeklySalesData.map((day, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-lg transition-all hover:from-teal-600 hover:to-teal-500"
                        style={{ height: `${day.percentage}%` }}
                        title={formatPrice(day.amount)}
                      />
                      <span className="text-xs text-gray-500 mt-2">{day.label}</span>
                      <span className="text-xs font-medium text-gray-700">{formatPrice(day.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

              {/* ORDERS - Tabla mejorada con acciones rápidas */}
          {activeSection === 'orders' && (
            <div className="space-y-4">
              {/* Header con filtros rápidos */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1 flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar por ID, cliente o email..."
                        value={orderSearch}
                        onChange={(e) => { setOrderSearch(e.target.value); setOrdersPage(1) }}
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <select
                      value={orderFilter}
                      onChange={(e) => { setOrderFilter(e.target.value); setOrdersPage(1) }}
                      className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">Todos</option>
                      <option value="pending">Pendientes</option>
                      <option value="processing">Procesando</option>
                      <option value="shipped">Enviados</option>
                      <option value="completed">Completados</option>
                      <option value="cancelled">Cancelados</option>
                    </select>
                  </div>
                  {/* Stats rápidos */}
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {pendingOrders} Pendientes
                    </span>
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> {completedOrders} Completados
                    </span>
                    <button 
                      onClick={exportOrdersToCSV}
                      className="px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-200 flex items-center gap-1"
                      title="Exportar a Excel"
                    >
                      <Download className="w-4 h-4" /> Exportar
                    </button>
                  </div>
                </div>
              </div>

              {/* Orders List */}
              {(() => {
                const filteredOrders = allOrders.filter(order => {
                  const orderStatus = order.status || order.paymentStatus || 'pending'
                  const matchesFilter = orderFilter === 'all' || orderStatus === orderFilter
                  const searchLower = orderSearch.toLowerCase()
                  const customerName = order.customer?.name || order.customerName || ''
                  const customerEmail = order.customer?.email || order.customerEmail || ''
                  const matchesSearch = orderSearch === '' || 
                    order.id.toLowerCase().includes(searchLower) ||
                    customerName.toLowerCase().includes(searchLower) ||
                    customerEmail.toLowerCase().includes(searchLower)
                  return matchesFilter && matchesSearch
                })

                const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
                const paginatedOrders = filteredOrders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage)

                return (
                  <div className="space-y-4">
                    {paginatedOrders.length > 0 ? (
                      paginatedOrders.map(order => (
                        <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                          {/* Order Header */}
                          <div className="p-4 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full ${
                                (order.status === 'completed' || order.paymentStatus === 'approved') ? 'bg-green-500' :
                                order.status === 'cancelled' ? 'bg-red-500' :
                                order.status === 'shipped' ? 'bg-indigo-500' :
                                order.status === 'processing' ? 'bg-blue-500' : 'bg-yellow-500'
                              }`} />
                              <div>
                                <p className="font-bold text-gray-800">{order.id}</p>
                                <p className="text-sm text-gray-500">{order.date} {((order as any).time) && `a las ${(order as any).time}`}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {(() => {
                                const displayStatus = order.status || order.paymentStatus || 'pending'
                                return (
                                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                                    displayStatus === 'paid' || displayStatus === 'approved' || displayStatus === 'completed' ? 'bg-green-100 text-green-700' :
                                    displayStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                    displayStatus === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                                    displayStatus === 'processing' ? 'bg-blue-100 text-blue-700' :
                                    'bg-yellow-100 text-yellow-700'
                                  }`}>
                                    {displayStatus === 'pending' ? 'Pendiente' : 
                                     displayStatus === 'processing' ? 'Procesando' :
                                     displayStatus === 'shipped' ? 'Enviado' :
                                     displayStatus === 'paid' || displayStatus === 'approved' ? 'Pagado' :
                                     displayStatus === 'completed' ? 'Completado' : 'Cancelado'}
                                  </span>
                                )
                              })()}
                              {/* Quick status buttons */}
                              <div className="flex items-center gap-1">
                                {order.status !== 'processing' && order.status !== 'completed' && order.status !== 'cancelled' && (
                                  <button 
                                    onClick={() => updateOrderStatus(order.id, 'processing')}
                                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium hover:bg-blue-200"
                                    title="Procesar"
                                  >
                                    P
                                  </button>
                                )}
                                {order.status !== 'shipped' && order.status !== 'completed' && order.status !== 'cancelled' && (
                                  <button 
                                    onClick={() => updateOrderStatus(order.id, 'shipped')}
                                    className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-200"
                                    title="Enviar"
                                  >
                                    E
                                  </button>
                                )}
                                {order.status !== 'completed' && order.status !== 'cancelled' && (
                                  <button 
                                    onClick={() => updateOrderStatus(order.id, 'completed')}
                                    className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium hover:bg-green-200"
                                    title="Completar"
                                  >
                                    C
                                  </button>
                                )}
                              </div>
                              <span className="font-bold text-xl text-teal-600">{formatPrice(order.total || 0)}</span>
                            </div>
                          </div>

                          {/* Order Details */}
                          <div className="p-4 border-t">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 mb-1">Cliente</p>
                                <p className="font-medium text-gray-800">{order.customer?.name || order.customerName || 'No especificado'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Teléfono</p>
                                <p className="font-medium text-gray-800">{order.customer?.phone || order.customerPhone || 'No especificado'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Email</p>
                                <p className="font-medium text-gray-800">{order.customer?.email || order.customerEmail || 'No especificado'}</p>
                              </div>
                              <div>
                                <p className="text-gray-500 mb-1">Cédula/NIT</p>
                                <p className="font-medium text-gray-800">{order.customer?.cedula || (order as any).customerCedula || 'No especificado'}</p>
                              </div>
                              <div className="lg:col-span-2">
                                <p className="text-gray-500 mb-1">Dirección de entrega</p>
                                <p className="font-medium text-gray-800">{order.customer?.address || order.shippingAddress || (order as any).address || 'No especificada'}</p>
                              </div>
                              <div className="lg:col-span-2">
                                <p className="text-gray-500 mb-1">Notas de entrega</p>
                                <p className="font-medium text-gray-800">{order.customer?.notes || (order as any).customerNotes || 'Sin notas'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Order Actions - Acciones rápidas */}
                          <div className="p-4 bg-gray-50 border-t flex flex-wrap items-center justify-between gap-4">
                            <button 
                              onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} 
                              className="text-teal-600 font-medium hover:underline flex items-center gap-2"
                            >
                              {expandedOrder === order.id ? (
                                <>Ocultar productos</>
                              ) : (
                                <>Ver {(order.items || []).length} producto(s)</>
                              )}
                            </button>
                            {/* Botones de acción rápida */}
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500 mr-1">Cambiar:</span>
                              {order.status !== 'processing' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'processing')}
                                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 flex items-center gap-1"
                                  title="Marcar como Procesando"
                                >
                                  <Clock className="w-3.5 h-3.5" /> Procesar
                                </button>
                              )}
                              {order.status !== 'shipped' && order.status !== 'cancelled' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'shipped')}
                                  className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 flex items-center gap-1"
                                  title="Marcar como Enviado"
                                >
                                  <Truck className="w-3.5 h-3.5" /> Enviar
                                </button>
                              )}
                              {order.status !== 'completed' && order.status !== 'cancelled' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'completed')}
                                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 flex items-center gap-1"
                                  title="Marcar como Completado"
                                >
                                  <CheckSquare className="w-3.5 h-3.5" /> Completar
                                </button>
                              )}
                              {order.status !== 'cancelled' && order.status !== 'completed' && (
                                <button 
                                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                  className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 flex items-center gap-1"
                                  title="Cancelar pedido"
                                >
                                  <XSquare className="w-3.5 h-3.5" /> Cancelar
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Notas del pedido */}
                          <div className="p-4 border-t bg-blue-50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <span className="font-medium text-gray-800 text-sm">Notas internas</span>
                              </div>
                              {editingNote !== order.id && (
                                <button 
                                  onClick={() => setEditingNote(order.id)}
                                  className="text-blue-600 text-sm hover:underline"
                                >
                                  {orderNotes[order.id] ? 'Editar' : 'Agregar nota'}
                                </button>
                              )}
                            </div>
                            
                            {editingNote === order.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={orderNotes[order.id] || ''}
                                  onChange={(e) => setOrderNotes({ ...orderNotes, [order.id]: e.target.value })}
                                  placeholder="Agregar una nota interna sobre este pedido..."
                                  className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  rows={2}
                                />
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => saveOrderNote(order.id)}
                                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                  >
                                    Guardar
                                  </button>
                                  <button 
                                    onClick={() => setEditingNote(null)}
                                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : orderNotes[order.id] ? (
                              <p className="text-sm text-gray-600 bg-white p-2 rounded-lg border">
                                {orderNotes[order.id]}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-400">Sin notas</p>
                            )}
                          </div>

                          {/* Expanded Items */}
                          {expandedOrder === order.id && (
                            <div className="p-4 border-t bg-gray-50">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2">Producto</th>
                                    <th className="text-center py-2">Cantidad</th>
                                    <th className="text-right py-2">Precio</th>
                                    <th className="text-right py-2">Subtotal</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(order.items || []).map((item: any, idx: number) => (
                                    <tr key={idx} className="border-b">
                                      <td className="py-2">{item.name || item.title}</td>
                                      <td className="text-center py-2">{item.quantity}</td>
                                      <td className="text-right py-2">{formatPrice(item.price || item.unit_price || 0)}</td>
                                      <td className="text-right py-2 font-medium">{formatPrice((item.price || item.unit_price || 0) * item.quantity)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-white rounded-2xl p-12 text-center">
                        <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No hay pedidos</p>
                      </div>
                    )}
                    
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-6">
                        <button 
                          onClick={() => setOrdersPage(p => Math.max(1, p - 1))} 
                          disabled={ordersPage === 1} 
                          className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                          Anterior
                        </button>
                        <span className="px-4 py-2">Página {ordersPage} de {totalPages}</span>
                        <button 
                          onClick={() => setOrdersPage(p => Math.min(totalPages, p + 1))} 
                          disabled={ordersPage === totalPages} 
                          className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                        >
                          Siguiente
                        </button>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* PRODUCTS - Grid/List con filtros */}
          {activeSection === 'products' && (
            <div className="space-y-4">
              {/* Header con filtros y vista */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex gap-3 flex-1">
                  <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <select
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                    className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="all">Todas las categorías</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 items-center">
                  {/* Toggle Grid/List */}
                  <div className="bg-gray-100 p-1 rounded-lg flex">
                    <button
                      onClick={() => setProductView('grid')}
                      className={`p-2 rounded-md transition-all ${productView === 'grid' ? 'bg-white shadow text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                      title="Vista de grid"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setProductView('list')}
                      className={`p-2 rounded-md transition-all ${productView === 'list' ? 'bg-white shadow text-teal-600' : 'text-gray-500 hover:text-gray-700'}`}
                      title="Vista de lista"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                  <button onClick={() => setShowCategoryModal(true)} className="bg-orange-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-orange-600">
                    <Plus className="w-4 h-4" /> Categoría
                  </button>
                  
                  {/* Menú de Export/Import */}
                  <div className="relative group">
                    <button className="bg-blue-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-700">
                      <FileSpreadsheet className="w-4 h-4" /> Importar/Exportar
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border hidden group-hover:block z-10">
                      <button 
                        onClick={exportProductsToCSV}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <Download className="w-4 h-4" /> Exportar productos
                      </button>
                      <button 
                        onClick={downloadProductTemplate}
                        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                      >
                        <FileText className="w-4 h-4" /> Descargar plantilla
                      </button>
                      <label className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm cursor-pointer">
                        <Upload className="w-4 h-4" /> Importar productos
                        <input 
                          type="file" 
                          accept=".csv" 
                          onChange={importProductsFromCSV}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                  
                  <button onClick={openAddModal} className="bg-teal-600 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-teal-700">
                    <Plus className="w-4 h-4" /> Producto
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Categorías</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {categories.map((cat: Category) => (
                    <div key={cat.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border">
                      <input 
                        type="checkbox" 
                        checked={storeSettings.categoriesVisibility?.[cat.id] !== false} 
                        onChange={(e) => updateStoreSettings({ categoriesVisibility: { ...storeSettings.categoriesVisibility, [cat.id]: e.target.checked } })} 
                        className="w-4 h-4 rounded text-teal-600" 
                      />
                      <span className="flex-1 text-sm font-medium truncate">{cat.name}</span>
                      <button 
                        onClick={() => {
                          const newName = prompt('Editar nombre:', cat.name)
                          if (newName && newName.trim()) {
                            const newIcon = prompt('Icono (Font Awesome):', cat.icon)
                            const updated = categories.map((c: Category) => c.id === cat.id ? { ...c, name: newName.trim(), icon: newIcon?.trim() || c.icon } : c)
                            setCategories(updated)
                            localStorage.setItem('creart_categories', JSON.stringify(updated))
                          }
                        }} 
                        className="text-blue-500 hover:bg-blue-50 p-1 rounded"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => {
                          if (products.some(p => p.category === cat.id)) { alert('Tiene productos'); return }
                          if (confirm(`Eliminar "${cat.name}"?`)) {
                            const updated = categories.filter((c: Category) => c.id !== cat.id)
                            setCategories(updated)
                            localStorage.setItem('creart_categories', JSON.stringify(updated))
                          }
                        }} 
                        className="text-red-500 hover:bg-red-50 p-1 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Products Grid/List */}
              {productView === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products
                    .filter(p => productFilter === 'all' || productFilter === 'low' ? (productFilter === 'low' ? (p.stock ?? 0) < 5 : p.category === p.category) : p.category === productFilter)
                    .filter(p => productSearch === '' || p.name.toLowerCase().includes(productSearch.toLowerCase()))
                    .map(product => (
                      <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="aspect-square bg-gray-100 relative">
                          {product.image ? (
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-12 h-12 text-gray-300" />
                            </div>
                          )}
                          {product.badge && (
                            <span className="absolute top-2 left-2 bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                              {product.badge}
                            </span>
                          )}
                          {product.stock === 0 && (
                            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              Agotado
                            </span>
                          )}
                          {product.featured && (
                            <span className="absolute bottom-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <Star className="w-3 h-3" fill="currentColor" /> Destacado
                            </span>
                          )}
                        </div>
                        <div className="p-4">
                          <p className="text-xs text-gray-500 mb-1">{categories.find(c => c.id === product.category)?.name}</p>
                          <h4 className="font-bold text-gray-800 mb-2 truncate">{product.name}</h4>
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-lg font-bold text-teal-600">{formatPrice(product.price)}</p>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${(product.stock ?? 0) < 5 ? 'text-red-500' : 'text-gray-600'}`}>
                                Stock: {product.stock ?? 0}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openEditModal(product)} 
                              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center justify-center gap-1"
                            >
                              <Edit className="w-4 h-4" /> Editar
                            </button>
                            <button 
                              onClick={() => setShowDeleteConfirm(product.id)} 
                              className="px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                /* Vista de lista */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left p-4 font-medium text-gray-600">Producto</th>
                        <th className="text-left p-4 font-medium text-gray-600">Categoría</th>
                        <th className="text-right p-4 font-medium text-gray-600">Precio</th>
                        <th className="text-center p-4 font-medium text-gray-600">Stock</th>
                        <th className="text-center p-4 font-medium text-gray-600">Estado</th>
                        <th className="text-right p-4 font-medium text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter(p => productFilter === 'all' || productFilter === 'low' ? (productFilter === 'low' ? (p.stock ?? 0) < 5 : p.category === p.category) : p.category === productFilter)
                        .filter(p => productSearch === '' || p.name.toLowerCase().includes(productSearch.toLowerCase()))
                        .map(product => (
                          <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-6 h-6 text-gray-300" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{product.name}</p>
                                  {product.badge && (
                                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">{product.badge}</span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-gray-600">{categories.find(c => c.id === product.category)?.name}</td>
                            <td className="p-4 text-right">
                              <p className="font-bold text-teal-600">{formatPrice(product.price)}</p>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <p className="text-xs text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`font-medium ${(product.stock ?? 0) < 5 ? 'text-red-500' : 'text-gray-600'}`}>
                                {product.stock ?? 0}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              {(product.stock ?? 0) === 0 ? (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">Agotado</span>
                              ) : (product.stock ?? 0) < 5 ? (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs">Bajo</span>
                              ) : (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">Disponible</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => openEditModal(product)} 
                                  className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                  title="Editar"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => setShowDeleteConfirm(product.id)} 
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {products.length === 0 && (
                <div className="bg-white rounded-2xl p-12 text-center">
                  <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">No hay productos</p>
                  <button onClick={openAddModal} className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700">
                    Agregar Producto
                  </button>
                </div>
              )}
            </div>
          )}

          {/* REVIEWS - Moderación de reseñas */}
          {activeSection === 'reviews' && (
            <div className="space-y-4">
              {/* Header con filtros */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1 flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Buscar reseñas..."
                        value={reviewSearch}
                        onChange={(e) => setReviewSearch(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <select
                      value={reviewFilter}
                      onChange={(e) => setReviewFilter(e.target.value as any)}
                      className="border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="all">Todas</option>
                      <option value="pending">Pendientes ({pendingReviewsCount})</option>
                      <option value="approved">Aprobadas</option>
                    </select>
                  </div>
                  {/* Stats */}
                  <div className="flex gap-2">
                    <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" /> {pendingReviewsCount} Pendientes
                    </span>
                    <span className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> {reviews.length - pendingReviewsCount} Aprobadas
                    </span>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {(() => {
                  const filteredReviews = reviews.filter(review => {
                    const matchesFilter = 
                      reviewFilter === 'all' || 
                      (reviewFilter === 'pending' && !review.approved) ||
                      (reviewFilter === 'approved' && review.approved)
                    const matchesSearch = 
                      reviewSearch === '' ||
                      review.userName?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                      review.comment?.toLowerCase().includes(reviewSearch.toLowerCase()) ||
                      review.productName?.toLowerCase().includes(reviewSearch.toLowerCase())
                    return matchesFilter && matchesSearch
                  })

                  return filteredReviews.length > 0 ? (
                    filteredReviews.map(review => (
                      <div key={review.id} className={`bg-white rounded-2xl p-6 shadow-sm border ${review.approved ? 'border-gray-100' : 'border-yellow-200'}`}>
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Info principal */}
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                                {review.userName?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{review.userName || 'Usuario anónimo'}</p>
                                <p className="text-sm text-gray-500">{review.date}</p>
                              </div>
                              {!review.approved && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
                                  Pendiente
                                </span>
                              )}
                            </div>
                            
                            {/* Rating */}
                            <div className="flex gap-1 mb-2">
                              {[1,2,3,4,5].map(i => (
                                <Star key={i} className={`w-5 h-5 ${i <= (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                              ))}
                            </div>

                            {/* Producto */}
                            {review.productName && (
                              <p className="text-sm text-teal-600 font-medium mb-2">
                                📦 {review.productName}
                              </p>
                            )}
                            
                            {/* Comentario */}
                            <p className="text-gray-700">{review.comment}</p>
                          </div>

                          {/* Acciones */}
                          <div className="flex flex-col gap-2">
                            {!review.approved && (
                              <button 
                                onClick={() => approveReview(review.id)}
                                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" /> Aprobar
                              </button>
                            )}
                            <button 
                              onClick={() => deleteReview(review.id)}
                              className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Eliminar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-2xl p-8 text-center">
                      <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No hay reseñas</p>
                    </div>
                  )
                })()}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeSection === 'settings' && (
            <div className="space-y-4">
              {/* Settings Tabs */}
              <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 flex gap-2 overflow-x-auto">
                {settingsTabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSettingsTab(tab.id)}
                    className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                      activeSettingsTab === tab.id 
                        ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                  </button>
                ))}
              </div>

              {/* Company Settings */}
              {activeSettingsTab === 'company' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                  <h3 className="font-bold text-xl text-gray-800">Información de la Empresa</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Tienda</label>
                      <input
                        type="text"
                        value={storeSettings.storeName}
                        onChange={(e) => updateStoreSettings({ storeName: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Slogan</label>
                      <input
                        type="text"
                        value={storeSettings.slogan}
                        onChange={(e) => updateStoreSettings({ slogan: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <textarea
                      value={storeSettings.description}
                      onChange={(e) => updateStoreSettings({ description: e.target.value })}
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                      <input
                        type="text"
                        value={storeSettings.city}
                        onChange={(e) => updateStoreSettings({ city: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                      <input
                        type="text"
                        value={storeSettings.address}
                        onChange={(e) => updateStoreSettings({ address: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                      <input
                        type="text"
                        value={storeSettings.phone}
                        onChange={(e) => updateStoreSettings({ phone: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={storeSettings.whatsapp}
                        onChange={(e) => updateStoreSettings({ whatsapp: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={storeSettings.email}
                        onChange={(e) => updateStoreSettings({ email: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>

                  <button onClick={handleSaveSettings} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Guardar Cambios
                  </button>
                </div>
              )}

              {/* Social Settings */}
              {activeSettingsTab === 'social' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                  <h3 className="font-bold text-xl text-gray-800">Redes Sociales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                      <input
                        type="url"
                        value={storeSettings.facebook}
                        onChange={(e) => updateStoreSettings({ facebook: e.target.value })}
                        placeholder="https://facebook.com/tupagina"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                      <input
                        type="url"
                        value={storeSettings.instagram}
                        onChange={(e) => updateStoreSettings({ instagram: e.target.value })}
                        placeholder="https://instagram.com/tuusuario"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">YouTube</label>
                      <input
                        type="url"
                        value={storeSettings.youtube}
                        onChange={(e) => updateStoreSettings({ youtube: e.target.value })}
                        placeholder="https://youtube.com/@tucanal"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">TikTok</label>
                      <input
                        type="url"
                        value={storeSettings.tiktok}
                        onChange={(e) => updateStoreSettings({ tiktok: e.target.value })}
                        placeholder="https://tiktok.com/@tuusuario"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-700">
                      <strong>Nota:</strong> Agrega las URLs completas de tus redes sociales para que aparezcan en el footer de la tienda.
                    </p>
                  </div>

                  <button onClick={handleSaveSettings} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Guardar Cambios
                  </button>
                </div>
              )}

              {/* Order Settings */}
              {activeSettingsTab === 'orders' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                  <h3 className="font-bold text-xl text-gray-800">Configuración de Pedidos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pedido Mínimo ($)</label>
                      <input
                        type="number"
                        value={storeSettings.minOrder}
                        onChange={(e) => updateStoreSettings({ minOrder: Number(e.target.value) })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Costo de Envío ($)</label>
                      <input
                        type="number"
                        value={storeSettings.shippingCost}
                        onChange={(e) => updateStoreSettings({ shippingCost: Number(e.target.value) })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tiempo de Entrega</label>
                      <input
                        type="text"
                        value={storeSettings.deliveryTime}
                        onChange={(e) => updateStoreSettings({ deliveryTime: e.target.value })}
                        placeholder="3-5 días hábiles"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium mb-2">Vista Previa:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>• Pedido mínimo: ${storeSettings.minOrder.toLocaleString('es-CO')}</p>
                      <p>• Costo de envío: ${storeSettings.shippingCost.toLocaleString('es-CO')}</p>
                      <p>• Tiempo de entrega: {storeSettings.deliveryTime}</p>
                    </div>
                  </div>

                  <button onClick={handleSaveSettings} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Guardar Cambios
                  </button>
                </div>
              )}

              {/* Payment Settings */}
              {activeSettingsTab === 'payments' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                  <h3 className="font-bold text-xl text-gray-800">Métodos de Pago</h3>
                  
                  <div className="space-y-3">
                    <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={storeSettings.paymentWhatsapp}
                        onChange={(e) => updateStoreSettings({ paymentWhatsapp: e.target.checked })}
                        className="w-5 h-5 rounded text-teal-600"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">WhatsApp</span>
                        <p className="text-sm text-gray-500">El cliente recibe el pedido por WhatsApp</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={storeSettings.paymentTransfer}
                        onChange={(e) => updateStoreSettings({ paymentTransfer: e.target.checked })}
                        className="w-5 h-5 rounded text-teal-600"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">Transferencia Bancaria</span>
                        <p className="text-sm text-gray-500">Pago directo a cuenta bancaria</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={storeSettings.paymentCash}
                        onChange={(e) => updateStoreSettings({ paymentCash: e.target.checked })}
                        className="w-5 h-5 rounded text-teal-600"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-800">Contra Entrega</span>
                        <p className="text-sm text-gray-500">Paga cuando recibes el producto</p>
                      </div>
                    </label>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-green-700">
                      <strong>Nota:</strong> Por ahora solo el método WhatsApp está activo en el checkout.
                    </p>
                  </div>

                  <button onClick={handleSaveSettings} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Guardar Cambios
                  </button>
                </div>
              )}

              {/* Policies Settings */}
              {activeSettingsTab === 'policies' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
                  <h3 className="font-bold text-xl text-gray-800">Políticas de la Tienda</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Política de Devoluciones</label>
                    <textarea
                      value={storeSettings.returnPolicy}
                      onChange={(e) => updateStoreSettings({ returnPolicy: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Describe tu política de devoluciones..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Términos y Condiciones</label>
                    <textarea
                      value={storeSettings.terms}
                      onChange={(e) => updateStoreSettings({ terms: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Describe los términos y condiciones..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Política de Privacidad</label>
                    <textarea
                      value={storeSettings.privacy}
                      onChange={(e) => updateStoreSettings({ privacy: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Describe tu política de privacidad..."
                    />
                  </div>

                  <button onClick={handleSaveSettings} className="bg-teal-600 text-white px-6 py-2.5 rounded-xl hover:bg-teal-700 flex items-center gap-2">
                    <Save className="w-4 h-4" /> Guardar Cambios
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
n              {/* AI Assistant Section */}
              {activeSection === 'aiassistant' && (
                <AIAssistant />
              )}
      </main>

      {/* Modal Agregar/Editar Producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">{editingProduct ? 'Editar' : 'Agregar'} Producto</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                  <select 
                    value={formData.category} 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {categories.map((c: Category) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio *</label>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio anterior</label>
                  <input 
                    type="number" 
                    value={formData.originalPrice} 
                    onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                  <input 
                    type="number" 
                    value={formData.stock} 
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta</label>
                  <select 
                    value={formData.badge} 
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Sin etiqueta</option>
                    <option value="Nuevo">Nuevo</option>
                    <option value="Oferta">Oferta</option>
                    <option value="Popular">Popular</option>
                    <option value="Destacado">Destacado</option>
                  </select>
                </div>
              </div>

              {/* Nuevos campos: SKU, Material, Dimensiones, Peso */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU (Código)</label>
                  <input 
                    type="text" 
                    value={formData.sku} 
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    placeholder="Ej: MESA-001" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material</label>
                  <select 
                    value={formData.material} 
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Seleccionar material</option>
                    <option value="Madera Oak">Madera Oak</option>
                    <option value="Madera Pino">Madera Pino</option>
                    <option value="Madera Cedro">Madera Cedro</option>
                    <option value="Madera Nogal">Madera Nogal</option>
                    <option value="MDF">MDF</option>
                    <option value="Triplay">Triplay</option>
                    <option value="Metal">Metal</option>
                    <option value="Vidrio">Vidrio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
                  <input 
                    type="number" 
                    value={formData.weight} 
                    onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    placeholder="0" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alerta stock bajo</label>
                  <input 
                    type="number" 
                    value={formData.lowStockAlert} 
                    onChange={(e) => setFormData({ ...formData, lowStockAlert: Number(e.target.value) })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    placeholder="5" 
                  />
                </div>
              </div>

              {/* Dimensiones */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ancho (cm)</label>
                  <input 
                    type="number" 
                    value={formData.dimensions.width} 
                    onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, width: Number(e.target.value) } })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    placeholder="0" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alto (cm)</label>
                  <input 
                    type="number" 
                    value={formData.dimensions.height} 
                    onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, height: Number(e.target.value) } })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    placeholder="0" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Profundo (cm)</label>
                  <input 
                    type="number" 
                    value={formData.dimensions.depth} 
                    onChange={(e) => setFormData({ ...formData, dimensions: { ...formData.dimensions, depth: Number(e.target.value) } })} 
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    placeholder="0" 
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <label 
                  htmlFor="featured" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.featured 
                      ? 'bg-yellow-50 border-yellow-400' 
                      : 'bg-transparent border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    id="featured" 
                    checked={formData.featured} 
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })} 
                    className="sr-only" 
                  />
                  <svg 
                    className={`w-6 h-6 ${formData.featured ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                    viewBox="0 0 24 24" 
                    fill={formData.featured ? "currentColor" : "none"} 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span className={`font-medium ${formData.featured ? 'text-yellow-700' : 'text-gray-600'}`}>
                    Producto destacado
                  </span>
                </label>

                <label 
                  htmlFor="active" 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 cursor-pointer transition-all ${
                    formData.active 
                      ? 'bg-green-50 border-green-400' 
                      : 'bg-transparent border-gray-200 hover:border-green-300'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    id="active" 
                    checked={formData.active} 
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })} 
                    className="sr-only" 
                  />
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${formData.active ? 'bg-green-500' : 'bg-gray-300'}`}>
                    {formData.active && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`font-medium ${formData.active ? 'text-green-700' : 'text-gray-600'}`}>
                    Producto activo (visible en tienda)
                  </span>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Imagen</label>
                <input 
                  type="url" 
                  value={formData.image} 
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  placeholder="https://..." 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea 
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                  rows={3} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Características (una por línea)</label>
                <textarea 
                  value={formData.features} 
                  onChange={(e) => setFormData({ ...formData, features: e.target.value })} 
                  rows={3} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white py-3 rounded-xl hover:from-teal-600 hover:to-teal-700 font-medium"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Agregar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Categoría */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-800">Agregar Categoría</h3>
              <button onClick={() => { setShowCategoryModal(false); setNewCategoryName(''); setNewCategoryId(''); setNewCategoryImage('') }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={newCategoryName} 
                  onChange={(e) => setNewCategoryName(e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  placeholder="Ej: Muebles de Jardín" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID (sin espacios)</label>
                <input 
                  type="text" 
                  value={newCategoryId} 
                  onChange={(e) => setNewCategoryId(e.target.value.toLowerCase().replace(/\s+/g, '-'))} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  placeholder="muebles-jardin" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icono (Font Awesome)</label>
                <input 
                  type="text" 
                  value={newCategoryIcon} 
                  onChange={(e) => setNewCategoryIcon(e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500 mb-2" 
                  placeholder="fa-box" 
                />
                <div className="grid grid-cols-8 gap-1 max-h-28 overflow-y-auto border border-gray-200 rounded-xl p-2">
                  {iconOptions.map(icon => (
                    <button 
                      key={icon} 
                      type="button" 
                      onClick={() => setNewCategoryIcon(icon)} 
                      className={`p-2 rounded-lg text-lg hover:bg-teal-100 ${newCategoryIcon === icon ? 'bg-teal-200' : ''}`} 
                      title={icon}
                    >
                      <i className={`fas ${icon}`}></i>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen (ImgBB)</label>
                <input 
                  type="text" 
                  value={newCategoryImage} 
                  onChange={(e) => setNewCategoryImage(e.target.value)} 
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" 
                  placeholder="https://i.ibb.co/..." 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => { setShowCategoryModal(false); setNewCategoryName(''); setNewCategoryId('') }} 
                  className="flex-1 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => {
                    if (!newCategoryName.trim() || !newCategoryId.trim()) { alert('Completa todos los campos'); return }
                    if (categories.find((c: Category) => c.id === newCategoryId)) { alert('Ya existe'); return }
                    const newCat = { id: newCategoryId, name: newCategoryName, icon: newCategoryIcon || 'fa-box', color: 'text-teal-600', image: newCategoryImage || '' }
                    const updated = [...categories, newCat]
                    setCategories(updated)
                    localStorage.setItem('creart_categories', JSON.stringify(updated))
                    setShowCategoryModal(false)
                    setNewCategoryName('')
                    setNewCategoryId('')
                    setNewCategoryImage('')
                    showToast('Categoría creada', 'success')
                  }} 
                  className="flex-1 bg-orange-500 text-white py-3 rounded-xl hover:bg-orange-600 font-medium"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Eliminar Producto</h3>
            <p className="text-gray-500 mb-6">¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(null)} 
                className="flex-1 border border-gray-200 py-3 rounded-xl hover:bg-gray-50 font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleDelete(showDeleteConfirm)} 
                className="flex-1 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
