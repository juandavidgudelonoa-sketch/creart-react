import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useApp } from '../context/AppContext'
import { Package, User, MapPin, Phone, Mail, Home, Save, ShoppingBag, Calendar, CreditCard } from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoggedIn, customer, setCustomer, saveCustomer, loadCustomer, orders, showToast } = useApp()
  const [activeTab, setActiveTab] = useState('data')

  useEffect(() => {
    loadCustomer()
  }, [])

  // Filtrar pedidos solo del usuario logueado
  const userOrders = orders.filter(order => {
    if (!order.customerEmail) return false
    const orderEmail = order.customerEmail.toLowerCase().trim()
    
    if (user?.email) {
      const userEmail = user.email.toLowerCase().trim()
      if (userEmail === orderEmail) return true
    }
    
    if (customer?.email) {
      const customerEmail = customer.email.toLowerCase().trim()
      if (customerEmail === orderEmail) return true
    }
    
    return false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveCustomer()
    showToast('Datos guardados correctamente', 'success')
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const statusLabels: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
    processing: { label: 'Procesando', className: 'bg-blue-100 text-blue-700' },
    shipped: { label: 'Enviado', className: 'bg-indigo-100 text-indigo-700' },
    completed: { label: 'Completado', className: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 md:w-12 md:h-12 text-teal-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800">Mi Perfil</h2>
            <p className="text-gray-500 mb-6 md:mb-8 text-base md:text-lg">Inicia sesión para ver tu perfil y pedidos</p>
            <Link to="/login" className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 md:py-4 px-8 md:px-10 rounded-full font-bold text-base md:text-lg hover:from-teal-700 hover:to-teal-800 transition transform hover:scale-105 shadow-lg">
              🔐 Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 md:py-8">
      <div className="container mx-auto px-2 md:px-4">
        
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800">👤 Mi Perfil</h1>
          <p className="text-gray-600 text-sm md:text-base">Gestiona tus datos y pedidos</p>
        </div>

        {/* Tabs - Estilo moderno */}
        <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'data' 
                ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg' 
                : 'bg-white hover:bg-gray-100 text-gray-700 shadow-md'
            }`}
          >
            <User className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Mis Datos</span>
            <span className="sm:hidden">Datos</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold transition whitespace-nowrap ${
              activeTab === 'orders' 
                ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-lg' 
                : 'bg-white hover:bg-gray-100 text-gray-700 shadow-md'
            }`}
          >
            <Package className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">Mis Pedidos</span>
            <span className="sm:hidden">Pedidos</span>
            {userOrders.length > 0 && (
              <span className="bg-white/30 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {userOrders.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'data' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            
            {/* User Info - Card perfil */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                  Información de Usuario
                </h2>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                {/* Avatar grande */}
                <div className="flex items-center gap-4 mb-4 md:mb-6">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-2xl md:text-3xl font-bold shadow-lg">
                    {(customer.name || user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-lg md:text-xl font-bold text-gray-800">{customer.name || user?.name || 'Usuario'}</p>
                    <p className="text-sm text-gray-500">{customer.email || user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Nombre</p>
                      <p className="font-semibold text-gray-800">{customer.name || user?.name || 'No registrado'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-semibold text-gray-800">{customer.email || user?.email || 'No registrado'}</p>
                    </div>
                  </div>
                  
                  {customer.phone && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Teléfono</p>
                        <p className="font-semibold text-gray-800">{customer.phone}</p>
                      </div>
                    </div>
                  )}
                  
                  {customer.address && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Dirección</p>
                        <p className="font-semibold text-gray-800">{customer.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Data - Formulario */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <Save className="w-5 h-5 md:w-6 md:h-6" />
                  Actualizar Datos
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Nombre completo</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={customer.name}
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                      placeholder="Tu nombre completo"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Teléfono</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                      placeholder="+57 300 123 4567"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={customer.email}
                      onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">Dirección</label>
                  <div className="relative">
                    <Home className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <textarea
                      value={customer.address}
                      onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 md:py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition resize-none"
                      placeholder="Tu dirección de entrega"
                      rows={3}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:from-teal-700 hover:to-teal-800 transition transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            {userOrders.length === 0 ? (
              <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl p-8 md:p-12 text-center">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ShoppingBag className="w-10 h-10 md:w-12 md:h-12 text-gray-400" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-800">No tienes pedidos aún</h2>
                <p className="text-gray-500 mb-6 md:mb-8 text-base">Cuando realices un pedido, aparecerá aquí.</p>
                <Link to="/catalog" className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 md:py-4 px-8 md:px-10 rounded-full font-bold text-base md:text-lg hover:from-teal-700 hover:to-teal-800 transition transform hover:scale-105 shadow-lg">
                  🛍️ Ver Catálogo
                </Link>
              </div>
            ) : (
              <div className="space-y-4 md:space-y-6">
                {userOrders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
                    {/* Header del pedido */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 md:p-6">
                      <div className="flex justify-between items-center flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <Package className="w-5 h-5 md:w-6 md:h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm md:text-base">{order.id}</p>
                            <p className="text-gray-400 text-xs md:text-sm flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {order.date}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-bold ${statusLabels[order.status]?.className || 'bg-gray-100 text-gray-700'}`}>
                          {statusLabels[order.status]?.label || order.status}
                        </span>
                      </div>
                    </div>
                    
                    {/* Productos */}
                    <div className="p-4 md:p-6">
                      <div className="space-y-2 md:space-y-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xl">🪑</div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-gray-800 text-sm md:text-base">{item.name}</p>
                                <p className="text-gray-500 text-xs md:text-sm">Cantidad: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-bold text-teal-600 text-sm md:text-base">{formatPrice(item.price * item.quantity)}</p>
                          </div>
                        ))}
                      </div>

                      {/* Total y método de pago */}
                      <div className="mt-4 md:mt-6 pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center flex-wrap gap-2">
                          <div className="flex items-center gap-2 text-gray-600 text-sm md:text-base">
                            <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                            <span>{order.paymentMethod || 'WhatsApp'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 font-medium text-sm md:text-base">Total:</span>
                            <span className="text-xl md:text-2xl font-bold text-teal-600">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
