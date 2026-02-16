import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useApp } from '../context/AppContext'
import { Package, User } from 'lucide-react'

export default function ProfilePage() {
  const { user, isLoggedIn, customer, setCustomer, saveCustomer, loadCustomer, orders, showToast } = useApp()
  const [activeTab, setActiveTab] = useState('data')

  // Cargar datos del cliente al iniciar
  useEffect(() => {
    loadCustomer()
  }, [])

  // Filtrar pedidos solo del usuario logueado (por email)
  // IMPORTANTE: Solo mostrar pedidos que tengan email y que coincida con el email del usuario
  const userOrders = orders.filter(order => {
    // Si el pedido no tiene email, no mostrarlo
    if (!order.customerEmail) return false
    
    // Normalizar email del pedido
    const orderEmail = order.customerEmail.toLowerCase().trim()
    
    // Verificar si hay usuario logueado
    if (user?.email) {
      const userEmail = user.email.toLowerCase().trim()
      if (userEmail === orderEmail) return true
    }
    
    // Verificar si hay datos del cliente guardados
    if (customer?.email) {
      const customerEmail = customer.email.toLowerCase().trim()
      if (customerEmail === orderEmail) return true
    }
    
    // Si no coincide con ninguno, no mostrar
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
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Debes iniciar sesión</h2>
        <Link to="/login" className="inline-block bg-teal-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-teal-700 transition">
          Iniciar Sesión
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'data' ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <User className="w-5 h-5" />
          Mis Datos
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'orders' ? 'bg-teal-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          <Package className="w-5 h-5" />
          Mis Pedidos
          {userOrders.length > 0 && (
            <span className="bg-teal-500 text-white text-xs px-2 py-0.5 rounded-full">
              {userOrders.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === 'data' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Información de Usuario</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <p className="text-lg">{customer.name || user?.name || 'No registrado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-lg">{customer.email || user?.email || 'No registrado'}</p>
              </div>
              {customer.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <p className="text-lg">{customer.phone}</p>
                </div>
              )}
              {customer.address && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <p className="text-lg">{customer.address}</p>
                </div>
              )}
            </div>
          </div>

          {/* Customer Data */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Mis Datos de Envío</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Tu teléfono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <textarea
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  placeholder="Tu dirección"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition"
              >
                Guardar Datos
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          {userOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-bold mb-2">No tienes pedidos aún</h2>
              <p className="text-gray-500 mb-6">Cuando realices un pedido, aparecerá aquí.</p>
              <Link to="/" className="inline-block bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 transition">
                Ver Productos
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {userOrders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div>
                      <span className="font-bold text-lg">{order.id}</span>
                      <span className="text-gray-500 ml-4">{order.date}</span>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${statusLabels[order.status]?.className || 'bg-gray-100 text-gray-700'}`}>
                      {statusLabels[order.status]?.label || order.status}
                    </span>
                  </div>
                  
                  <div className="border-t pt-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-2">
                        <span className="text-gray-600">{item.name} x{item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-teal-600">{formatPrice(order.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
