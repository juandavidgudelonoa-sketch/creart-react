import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useApp } from '../context/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { Package, User, Loader2, MapPin, Phone, Mail, Home, Save, Edit3, ShoppingBag, Clock, CheckCircle, XCircle, Truck, Box } from 'lucide-react'
import type { Customer } from '../types'

export default function ProfilePage() {
  const { customer, setCustomer: setAppCustomer, saveCustomer: saveAppCustomer, loadCustomer: loadAppCustomer, orders, showToast } = useApp()
  const { user: authUser, customer: authCustomer, isLoggedIn, loading: authLoading, saveCustomer: saveAuthCustomer, setCustomer: setAuthCustomer } = useAuth()
  const [activeTab, setActiveTab] = useState('data')

  // Estado local para editar datos
  const [editingCustomer, setEditingCustomer] = useState<Customer>({
    name: '',
    phone: '',
    email: '',
    address: ''
  })

  // Cargar datos del cliente al iniciar
  useEffect(() => {
    loadAppCustomer()
  }, [])

  // Sincronizar editingCustomer cuando cambien los datos
  useEffect(() => {
    const customerData = authCustomer || customer
    if (customerData && (!editingCustomer.name && !editingCustomer.email)) {
      setEditingCustomer({
        name: customerData.name || '',
        phone: customerData.phone || '',
        email: customerData.email || '',
        address: customerData.address || ''
      })
    }
  }, [])

  const user = authUser
  const currentCustomer = authCustomer || customer

  // Mostrar loading mientras carga
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-teal-600" />
          <p className="mt-4 text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  // Filtrar pedidos solo del usuario logueado
  const userOrders = orders.filter(order => {
    if (!order.customerEmail) return false
    const orderEmail = order.customerEmail.toLowerCase().trim()
    
    if (user?.email) {
      const userEmail = user.email.toLowerCase().trim()
      if (userEmail === orderEmail) return true
    }
    
    if (currentCustomer?.email) {
      const customerEmail = currentCustomer.email.toLowerCase().trim()
      if (customerEmail === orderEmail) return true
    }
    
    return false
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; bg: string; text: string; icon: any }> = {
      pending: { label: 'Pendiente', bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      processing: { label: 'Procesando', bg: 'bg-blue-100', text: 'text-blue-700', icon: Box },
      shipped: { label: 'Enviado', bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Truck },
      completed: { label: 'Completado', bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      cancelled: { label: 'Cancelado', bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    }
    return statusMap[status] || statusMap.pending
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Debes iniciar sesión</h2>
          <p className="text-gray-500 mb-6">Para ver tu perfil y pedidos, necesitas estar autenticado.</p>
          <Link to="/login" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-8 rounded-full font-semibold hover:opacity-90 transition">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    )
  }

  const handleCustomerChange = (field: keyof Customer, value: string) => {
    setEditingCustomer(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAppCustomer(editingCustomer)
    if (setAuthCustomer) {
      setAuthCustomer(editingCustomer)
    }
    if (isLoggedIn) {
      await saveAuthCustomer()
    }
    saveAppCustomer()
    showToast('Datos guardados correctamente', 'success')
  }

  // Obtener iniciales para avatar
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const userName = currentCustomer.name || (user as any)?.displayName || user?.email?.split('@')[0] || 'Usuario'
  const userEmail = currentCustomer.email || user?.email || ''

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
              {getInitials(userName)}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{userName}</h1>
              <p className="text-teal-200 flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" /> {userEmail}
              </p>
              {currentCustomer.phone && (
                <p className="text-teal-200 flex items-center gap-2 mt-1">
                  <Phone className="w-4 h-4" /> {currentCustomer.phone}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
              activeTab === 'data' 
                ? 'bg-white text-teal-600' 
                : 'bg-white/70 text-gray-500 hover:bg-white hover:text-teal-600'
            }`}
          >
            <User className="w-5 h-5" />
            Mis Datos
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
              activeTab === 'orders' 
                ? 'bg-white text-teal-600' 
                : 'bg-white/70 text-gray-500 hover:bg-white hover:text-teal-600'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            Mis Pedidos
            {userOrders.length > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                {userOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'data' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del Usuario */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">Información de Cuenta</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Nombre</p>
                    <p className="font-medium">{userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="font-medium">{userEmail}</p>
                  </div>
                </div>
                {currentCustomer.phone && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Teléfono</p>
                      <p className="font-medium">{currentCustomer.phone}</p>
                    </div>
                  </div>
                )}
                {currentCustomer.address && (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Dirección</p>
                      <p className="font-medium">{currentCustomer.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          
            {/* Datos de Envío - Formulario */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Home className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold">Datos de Envío</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    value={editingCustomer.name}
                    onChange={(e) => handleCustomerChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="Tu nombre completo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                  <input
                    type="tel"
                    value={editingCustomer.phone}
                    onChange={(e) => handleCustomerChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="+57 300 123 4567"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) => handleCustomerChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="tu@email.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de envío</label>
                  <textarea
                    value={editingCustomer.address}
                    onChange={(e) => handleCustomerChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition"
                    placeholder="Calle, número, barrio, ciudad..."
                    rows={3}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Guardar Datos
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Pedidos */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {userOrders.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">No tienes pedidos</h3>
                <p className="text-gray-500 mb-6">¡Explora nuestro catálogo y haz tu primer pedido!</p>
                <Link to="/catalog" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-8 rounded-full font-semibold hover:opacity-90 transition">
                  Ver Catálogo
                </Link>
              </div>
            ) : (
              userOrders.map(order => {
                const statusInfo = getStatusInfo(order.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Header del pedido */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Número de pedido</p>
                          <p className="font-bold text-lg">{order.id}</p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg} ${statusInfo.text}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="font-medium">{statusInfo.label}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Productos del pedido */}
                    <div className="p-4">
                      <div className="space-y-3">
                        {order.items?.map((item: any, index: number) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                              ) : (
                                <Package className="w-6 h-6 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-teal-600">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>
                      
                      {/* Total */}
                      <div className="mt-4 pt-4 border-t flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">Fecha del pedido</p>
                          <p className="font-medium">{formatDate(order.date)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-2xl font-bold text-teal-600">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}
