import { useState } from 'react'
import { Link } from 'react-router'
import { Package, ShoppingCart, DollarSign, TrendingUp, Settings, Plus, Edit, Trash2, Shield, X, Image as ImageIcon, Eye, CheckCircle, AlertTriangle } from 'lucide-react'
import { useApp, Product, Order } from '../context/AppContext'
import SettingsPanel from '../components/SettingsPanel'

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

// Lista de iconos de Font Awesome para seleccionar
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
  const { orders, products, user, addProduct, updateProduct, deleteProduct, updateOrderStatus, storeSettings, updateStoreSettings } = useApp()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  
  // Modal para agregar categoría
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryId, setNewCategoryId] = useState('')
  const [newCategoryIcon, setNewCategoryIcon] = useState('fa-box')
  const [newCategoryImage, setNewCategoryImage] = useState('')
  
  // Estado de categorías
  const [categories, setCategories] = useState(() => {
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
    featured: false,
    features: '',
  })

  const isAdmin = user?.isAdmin === true

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Acceso Denegado</h2>
        <p className="text-gray-500 mb-8">No tienes permisos de administrador para acceder a esta página.</p>
        <Link to="/login" className="bg-teal-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-teal-700">
          Ir a Login
        </Link>
      </div>
    )
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)
  const totalOrders = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending').length
  const completedOrders = orders.filter(o => o.status === 'completed').length
  const lowStockProducts = products.filter(p => p.stock && p.stock < 5).length
  const outOfStock = products.filter(p => !p.stock || p.stock === 0).length
  
  // Productos más vendidos
  const productSales: Record<string, number> = {}
  orders.forEach(order => {
    order.items.forEach(item => {
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
  const uniqueCustomers = new Set(orders.map(o => o.customerEmail).filter(Boolean)).size

  // Pedidos de hoy
  const today = new Date().toLocaleDateString('es-CO')
  const todayOrders = orders.filter(o => o.date === today).length

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'orders', label: 'Pedidos', icon: ShoppingCart },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ]

  const stats = [
    { label: 'Pedidos Totales', value: totalOrders, icon: ShoppingCart, color: 'bg-blue-500' },
    { label: 'Pedidos Pendientes', value: pendingOrders, icon: Package, color: 'bg-yellow-500' },
    { label: 'Pedidos Completados', value: completedOrders, icon: CheckCircle, color: 'bg-green-500' },
    { label: 'Productos con Bajo Stock', value: lowStockProducts, icon: AlertTriangle, color: 'bg-red-500' },
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
      featured: false,
      features: '',
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
      featured: product.featured || false,
      features: product.features?.join('\n') || '',
    })
    setShowModal(true)
  }

  // Save product (add or update)
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
      rating: editingProduct?.rating || 4,
      reviews: editingProduct?.reviews || 0,
      features: formData.features ? formData.features.split('\n').filter(f => f.trim()) : [],
      featured: formData.featured,
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, productData)
    } else {
      addProduct(productData)
    }
    
    setShowModal(false)
  }

  // Delete product
  const handleDelete = (id: string) => {
    deleteProduct(id)
    setShowDeleteConfirm(null)
  }

  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Panel de Admin</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 bg-gray-100 rounded-lg">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-3 md:p-6">
            <div className={`w-8 h-8 md:w-12 md:h-12 ${stat.color} rounded-lg flex items-center justify-center mb-2 md:mb-4`}>
              <stat.icon className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <p className="text-xl md:text-2xl font-bold">{stat.value}</p>
            <p className="text-gray-500 text-xs md:text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs - Desktop */}
      <div className="hidden md:flex gap-2 mb-6 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Tabs - Mobile */}
      <div className="md:hidden mb-4">
        <div className={`bg-white rounded-lg shadow-md p-2 ${sidebarOpen ? 'block' : 'hidden'}`}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false) }}
              className={`w-full px-4 py-3 rounded-lg flex items-center gap-3 ${activeTab === tab.id ? 'bg-teal-600 text-white' : 'hover:bg-gray-100'}`}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'dashboard' && (
          <div>
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6">Resumen de la Tienda</h2>
            
            {/* Stats Grid - Primera fila */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 md:p-4 rounded-lg text-white">
                <p className="text-xs md:text-sm opacity-80">Pedidos Totales</p>
                <p className="text-2xl md:text-3xl font-bold">{totalOrders}</p>
                <p className="text-xs opacity-70">{todayOrders} hoy</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-3 md:p-4 rounded-lg text-white">
                <p className="text-xs md:text-sm opacity-80">Pendientes</p>
                <p className="text-2xl md:text-3xl font-bold">{pendingOrders}</p>
                <p className="text-xs opacity-70">por procesar</p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 md:p-4 rounded-lg text-white">
                <p className="text-xs md:text-sm opacity-80">Completados</p>
                <p className="text-2xl md:text-3xl font-bold">{completedOrders}</p>
                <p className="text-xs opacity-70">{totalOrders > 0 ? Math.round((completedOrders/totalOrders)*100) : 0}%</p>
              </div>
              <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 md:p-4 rounded-lg text-white">
                <p className="text-xs md:text-sm opacity-80">Productos</p>
                <p className="text-2xl md:text-3xl font-bold">{products.length}</p>
                <p className="text-xs opacity-70">{lowStockProducts} bajo stock</p>
              </div>
            </div>

            {/* Stats Grid - Segunda fila */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mb-4 md:mb-6">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-3 md:p-4 rounded-lg text-white">
                <p className="text-xs md:text-sm opacity-80">Ingresos Totales</p>
                <p className="text-lg md:text-2xl font-bold">{formatPrice(totalRevenue)}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-3 md:p-4 rounded-lg text-white">
                <p className="text-xs md:text-sm opacity-80">Este Mes</p>
                <p className="text-lg md:text-2xl font-bold">{formatPrice(monthlyRevenue)}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 p-3 md:p-4 rounded-lg text-white">
                <p className="text-xs md:text-sm opacity-80">Clientes</p>
                <p className="text-lg md:text-2xl font-bold">{uniqueCustomers}</p>
              </div>
              <div className={`p-3 md:p-4 rounded-lg ${outOfStock > 0 ? 'bg-red-500' : 'bg-gray-400'} text-white`}>
                <p className="text-xs md:text-sm opacity-80">Sin Stock</p>
                <p className="text-lg md:text-2xl font-bold">{outOfStock}</p>
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-gradient-to-r from-teal-500 to-teal-700 p-4 md:p-6 rounded-lg text-white mb-4 md:mb-8">
              <p className="text-sm opacity-80">Ingresos Totales</p>
              <p className="text-2xl md:text-4xl font-bold">{formatPrice(totalRevenue)}</p>
            </div>

            {/* Low Stock Alert */}
            {lowStockProducts > 0 && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-8">
                <p className="font-semibold text-red-700">⚠️ Alerta de Stock</p>
                <p className="text-red-600">{lowStockProducts} producto(s) con stock bajo (menos de 5 unidades)</p>
              </div>
            )}

            {/* Recent Orders */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">Últimos Pedidos</h3>
              <div className="space-y-2">
                {orders.slice(0, 5).map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{order.id}</span>
                      <span className="text-gray-500 ml-2">{order.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold">{formatPrice(order.total)}</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-gray-500">No hay pedidos</p>}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
              <button onClick={openAddModal} className="p-3 md:p-4 bg-teal-50 rounded-lg hover:bg-teal-100 text-center">
                <Plus className="w-6 h-8 md:w-8 mx-auto text-teal-600 mb-1 md:mb-2" />
                <span className="text-teal-700 font-medium text-sm md:text-base">Producto</span>
              </button>
              <button onClick={() => setActiveTab('orders')} className="p-3 md:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 text-center">
                <ShoppingCart className="w-6 h-8 md:w-8 mx-auto text-blue-600 mb-1 md:mb-2" />
                <span className="text-blue-700 font-medium text-sm md:text-base">Pedidos</span>
              </button>
              <button onClick={() => setShowCategoryModal(true)} className="p-3 md:p-4 bg-orange-50 rounded-lg hover:bg-orange-100 text-center">
                <Package className="w-6 h-8 md:w-8 mx-auto text-orange-600 mb-1 md:mb-2" />
                <span className="text-orange-700 font-medium text-sm md:text-base">Categoría</span>
              </button>
              <button onClick={() => setActiveTab('settings')} className="p-3 md:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 text-center">
                <Settings className="w-6 h-8 md:w-8 mx-auto text-purple-600 mb-1 md:mb-2" />
                <span className="text-purple-700 font-medium text-sm md:text-base">Ajustes</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Gestión de Pedidos</h2>
            
            {/* Filtros */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por ID, cliente o email..."
                  value={orderSearch}
                  onChange={(e) => { setOrderSearch(e.target.value); setOrdersPage(1) }}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <select
                value={orderFilter}
                onChange={(e) => { setOrderFilter(e.target.value); setOrdersPage(1) }}
                className="border rounded-lg px-4 py-2"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviados</option>
                <option value="completed">Completados</option>
                <option value="cancelled">Cancelados</option>
              </select>
            </div>

            {/* Lista de pedidos */}
            {(() => {
              const filteredOrders = orders.filter(order => {
                const matchesFilter = orderFilter === 'all' || order.status === orderFilter
                const searchLower = orderSearch.toLowerCase()
                const matchesSearch = orderSearch === '' || 
                  order.id.toLowerCase().includes(searchLower) ||
                  (order.customerName || '').toLowerCase().includes(searchLower) ||
                  (order.customerEmail || '').toLowerCase().includes(searchLower)
                return matchesFilter && matchesSearch
              })

              const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
              const paginatedOrders = filteredOrders.slice((ordersPage - 1) * ordersPerPage, ordersPage * ordersPerPage)

              return (
                <div className="space-y-4">
                  {paginatedOrders.length > 0 ? (
                    paginatedOrders.map(order => (
                      <div key={order.id} className="border rounded-lg overflow-hidden">
                        <div className="p-4 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <span className="font-bold">{order.id}</span>
                            <span className="text-gray-500 ml-3">{order.date}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm ${
                              order.status === 'completed' ? 'bg-green-100 text-green-700' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              order.status === 'shipped' ? 'bg-indigo-100 text-indigo-700' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {order.status === 'pending' ? 'Pendiente' : 
                               order.status === 'processing' ? 'Procesando' :
                               order.status === 'shipped' ? 'Enviado' :
                               order.status === 'completed' ? 'Completado' : 'Cancelado'}
                            </span>
                            <span className="font-bold text-teal-600">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                        <div className="p-4 border-t">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div><span className="text-gray-500">Cliente:</span> <p className="font-medium">{order.customerName || 'No especificado'}</p></div>
                            <div><span className="text-gray-500">Teléfono:</span> <p className="font-medium">{order.customerPhone || 'No especificado'}</p></div>
                            <div><span className="text-gray-500">Email:</span> <p className="font-medium">{order.customerEmail || 'No especificado'}</p></div>
                          </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex flex-wrap items-center justify-between gap-4">
                          <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="text-teal-600 text-sm">
                            {expandedOrder === order.id ? '▼ Ocultar' : `▶ Ver productos (${order.items.length})`}
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Estado:</span>
                            <select 
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                              className="border rounded px-2 py-1 text-sm"
                            >
                              <option value="pending">Pendiente</option>
                              <option value="processing">Procesando</option>
                              <option value="shipped">Enviado</option>
                              <option value="completed">Completado</option>
                              <option value="cancelled">Cancelado</option>
                            </select>
                          </div>
                        </div>
                        {expandedOrder === order.id && (
                          <div className="p-4 border-t">
                            <table className="w-full text-sm">
                              <thead><tr className="border-b"><th className="text-left py-2">Producto</th><th className="text-center py-2">Cantidad</th><th className="text-right py-2">Precio</th></tr></thead>
                              <tbody>
                                {order.items.map((item, idx) => (
                                  <tr key={idx} className="border-b">
                                    <td className="py-2">{item.name}</td>
                                    <td className="text-center py-2">{item.quantity}</td>
                                    <td className="text-right py-2">{formatPrice(item.price * item.quantity)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No hay pedidos</p>
                  )}
                  
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <button onClick={() => setOrdersPage(p => Math.max(1, p - 1))} disabled={ordersPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">Anterior</button>
                      <span>Página {ordersPage} de {totalPages}</span>
                      <button onClick={() => setOrdersPage(p => Math.min(totalPages, p + 1))} disabled={ordersPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">Siguiente</button>
                    </div>
                  )}
                </div>
              )
            })()}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-lg md:text-xl font-bold">Gestión de Productos</h2>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowCategoryModal(true)} className="bg-orange-500 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-1 md:gap-2 hover:bg-orange-600 text-sm md:text-base">
                  <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Categoría</span>
                </button>
                <button onClick={openAddModal} className="bg-teal-600 text-white px-3 md:px-4 py-2 rounded-lg flex items-center gap-1 md:gap-2 hover:bg-teal-700 text-sm md:text-base">
                  <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Producto</span>
                </button>
              </div>
            </div>

            {/* Categorías */}
            <div className="bg-gray-50 border rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Categorías</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center gap-2 p-3 bg-white rounded border">
                    <input type="checkbox" checked={storeSettings.categoriesVisibility?.[cat.id] !== false} onChange={(e) => updateStoreSettings({ categoriesVisibility: { ...storeSettings.categoriesVisibility, [cat.id]: e.target.checked } })} className="w-4 h-4" />
                    <span className="flex-1 text-sm font-medium">{cat.name}</span>
                    <button onClick={() => {
                      const newName = prompt('Editar nombre:', cat.name)
                      if (newName && newName.trim()) {
                        const newIcon = prompt('Icono (Font Awesome):', cat.icon)
                        const updated = categories.map(c => c.id === cat.id ? { ...c, name: newName.trim(), icon: newIcon?.trim() || c.icon } : c)
                        setCategories(updated)
                        localStorage.setItem('creart_categories', JSON.stringify(updated))
                      }
                    }} className="text-blue-500 p-1"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => {
                      if (products.some(p => p.category === cat.id)) { alert('Tiene productos'); return }
                      if (confirm(`Eliminar "${cat.name}"?`)) {
                        const updated = categories.filter(c => c.id !== cat.id)
                        setCategories(updated)
                        localStorage.setItem('creart_categories', JSON.stringify(updated))
                      }
                    }} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </div>

            {/* Productos por categoría */}
            <div className="space-y-4 md:space-y-6">
              {categories.map(cat => {
                const catProducts = products.filter(p => p.category === cat.id)
                if (catProducts.length === 0) return null
                return (
                  <div key={cat.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-3 md:px-4 py-2">
                      <h3 className="font-semibold text-sm md:text-base">{cat.name} ({catProducts.length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b"><th className="text-left p-2 whitespace-nowrap">Imagen</th><th className="text-left p-2 whitespace-nowrap">Producto</th><th className="text-left p-2 whitespace-nowrap">Precio</th><th className="text-left p-2 whitespace-nowrap">Stock</th><th className="text-left p-2 whitespace-nowrap">Acciones</th></tr></thead>
                        <tbody>
                          {catProducts.map(product => (
                            <tr key={product.id} className="border-b">
                              <td className="p-2"><div className="w-10 md:w-12 h-8 md:h-10 bg-gray-100 rounded">{product.image && <img src={product.image} alt="" className="w-full h-full object-cover" />}</div></td>
                              <td className="p-2 max-w-[120px] md:max-w-none truncate">{product.name}</td>
                              <td className="p-2 whitespace-nowrap">{formatPrice(product.price)}</td>
                              <td className="p-2">{product.stock}</td>
                              <td className="p-2">
                                <div className="flex gap-2">
                                  <button onClick={() => openEditModal(product)} className="text-blue-500 p-1"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => setShowDeleteConfirm(product.id)} className="text-red-500 p-1"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              })}
              {products.length === 0 && <p className="text-gray-500 text-center py-8">No hay productos</p>}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsPanel />
        )}
      </div>

      {/* Modal Agregar/Editar Producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-3 md:p-4 border-b">
              <h3 className="text-lg md:text-xl font-bold">{editingProduct ? 'Editar' : 'Agregar'} Producto</h3>
              <button onClick={() => setShowModal(false)} className="p-1"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-3 md:p-4 space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                <div><label className="block text-sm font-medium mb-1">Nombre *</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full border rounded-lg px-3 md:px-4 py-2 text-base" required /></div>
                <div><label className="block text-sm font-medium mb-1">Categoría *</label><select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full border rounded-lg px-3 md:px-4 py-2 text-base">{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="block text-sm font-medium mb-1">Precio *</label><input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="w-full border rounded-lg px-3 md:px-4 py-2 text-base" required /></div>
                <div><label className="block text-sm font-medium mb-1">Precio anterior</label><input type="number" value={formData.originalPrice} onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })} className="w-full border rounded-lg px-3 md:px-4 py-2 text-base" /></div>
                <div><label className="block text-sm font-medium mb-1">Stock</label><input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full border rounded-lg px-3 md:px-4 py-2 text-base" /></div>
                <div><label className="block text-sm font-medium mb-1">Etiqueta</label><input type="text" value={formData.badge} onChange={(e) => setFormData({ ...formData, badge: e.target.value })} className="w-full border rounded-lg px-3 md:px-4 py-2 text-base" placeholder="Ej: Nuevo, Oferta" /></div>
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="featured" className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition ${
                  formData.featured 
                    ? 'bg-yellow-50 border-yellow-400' 
                    : 'bg-transparent border-gray-300 hover:border-yellow-300'
                }`}>
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
              </div>
              <div><label className="block text-sm font-medium mb-1">URL Imagen</label><input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} className="w-full border rounded-lg px-4 py-2" placeholder="https://..." /></div>
              <div><label className="block text-sm font-medium mb-1">Descripción</label><textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full border rounded-lg px-4 py-2" /></div>
              <div><label className="block text-sm font-medium mb-1">Características (una por línea)</label><textarea value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} rows={3} className="w-full border rounded-lg px-4 py-2" /></div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 border py-2 rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700">{editingProduct ? 'Guardar' : 'Agregar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Categoría */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 md:p-4">
          <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h3 className="text-lg md:text-xl font-bold">Agregar Categoría</h3>
              <button onClick={() => { setShowCategoryModal(false); setNewCategoryName(''); setNewCategoryId(''); setNewCategoryImage('') }} className="p-1"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 md:space-y-4">
              <div><label className="block text-sm font-medium mb-1">Nombre</label><input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="w-full border rounded-lg px-3 md:px-4 py-2 text-base" placeholder="Ej: Muebles de Jardín" /></div>
              <div><label className="block text-sm font-medium mb-1">ID (sin espacios)</label><input type="text" value={newCategoryId} onChange={(e) => setNewCategoryId(e.target.value.toLowerCase().replace(/\s+/g, '-'))} className="w-full border rounded-lg px-3 md:px-4 py-2 text-base" placeholder="muebles-jardin" /></div>
              <div>
                <label className="block text-sm font-medium mb-1">Icono (Font Awesome)</label>
                <input type="text" value={newCategoryIcon} onChange={(e) => setNewCategoryIcon(e.target.value)} className="w-full border rounded-lg px-3 md:px-4 py-2 mb-2 text-base" placeholder="fa-box" />
                <div className="grid grid-cols-6 md:grid-cols-8 gap-1 max-h-24 md:max-h-28 overflow-y-auto border rounded p-2">
                  {iconOptions.map(icon => (
                    <button key={icon} type="button" onClick={() => setNewCategoryIcon(icon)} className={`p-1 rounded text-lg hover:bg-teal-100 ${newCategoryIcon === icon ? 'bg-teal-200' : ''}`} title={icon}>
                      <i className={`fas ${icon}`}></i>
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-1">URL de Imagen</label><input type="text" value={newCategoryImage} onChange={(e) => setNewCategoryImage(e.target.value)} className="w-full border rounded-lg px-3 md:px-4 py-2 text-base" placeholder="https://i.ibb.co/..." /></div>
              <div className="flex gap-3 md:gap-4 pt-3 md:pt-4">
                <button onClick={() => { setShowCategoryModal(false); setNewCategoryName(''); setNewCategoryId('') }} className="flex-1 border py-2 rounded-lg hover:bg-gray-50 text-sm md:text-base">Cancelar</button>
                <button onClick={() => {
                  if (!newCategoryName.trim() || !newCategoryId.trim()) { alert('Completa todos los campos'); return }
                  if (categories.find(c => c.id === newCategoryId)) { alert('Ya existe'); return }
                  const newCat = { id: newCategoryId, name: newCategoryName, icon: newCategoryIcon || 'fa-box', color: 'text-teal-600', image: newCategoryImage || '' }
                  const updated = [...categories, newCat]
                  setCategories(updated)
                  localStorage.setItem('creart_categories', JSON.stringify(updated))
                  setShowCategoryModal(false)
                  setNewCategoryName('')
                  setNewCategoryId('')
                  setNewCategoryImage('')
                  alert('Categoría creada')
                }} className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 text-sm md:text-base">Crear</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar eliminar */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md">
            <h3 className="text-lg font-bold mb-4">Eliminar Producto</h3>
            <p className="text-gray-500 mb-6">¿Estás seguro?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 border py-2 rounded-lg">Cancelar</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 bg-red-500 text-white py-2 rounded-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
