import { Link } from 'react-router'
import { Minus, Plus, Trash2, CheckCircle, ShoppingBag, MapPin, CreditCard, Truck, ShieldCheck, Gift } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useState, useEffect } from 'react'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal, cartIVA, cartTotal, clearCart, customer, storeSettings, user, loadCustomer, addOrder, setCustomer, saveCustomer } = useApp()
  
  useEffect(() => {
    loadCustomer()
  }, [])
  
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    cedula: '',
    notes: '',
  })
  
  useEffect(() => {
    setCustomerData(prev => ({
      ...prev,
      name: customer.name || user?.name || prev.name,
      phone: customer.phone || prev.phone,
      address: customer.address || prev.address,
      email: user?.email || customer.email || prev.email,
    }))
  }, [user, customer])
  
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [selectedPayment, setSelectedPayment] = useState<string>('')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const whatsappNumber = storeSettings.whatsapp?.replace(/\D/g, '') || '573159934696'
  const minOrder = Number(storeSettings.minOrder) || 0
  const shippingCost = Number(storeSettings.shippingCost) || 0
  const deliveryTime = storeSettings.deliveryTime || '3-5 días hábiles'
  
  const freeShipping = minOrder > 0 && cartSubtotal >= minOrder
  const finalShipping = freeShipping ? 0 : shippingCost
  const totalWithShipping = cartTotal + finalShipping

  const saveOrder = (paymentMethod: string) => {
    if (cart.length === 0) return null
    
    if (!customerData.name.trim()) {
      alert('Por favor ingresa tu nombre')
      return null
    }
    if (!customerData.phone.trim()) {
      alert('Por favor ingresa tu teléfono')
      return null
    }
    if (!customerData.address.trim()) {
      alert('Por favor ingresa tu dirección')
      return null
    }
    
    const newOrderId = `ORD-${Date.now()}`
    
    addOrder(cart, totalWithShipping, customerData.address, {
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email,
      cedula: customerData.cedula,
      notes: customerData.notes,
      paymentMethod: paymentMethod,
    })
    
    setCustomer({
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email,
      address: customerData.address
    })
    saveCustomer()
    
    clearCart()
    setOrderId(newOrderId)
    setOrderConfirmed(true)
    
    return newOrderId
  }

  const handleCheckout = () => {
    const order = saveOrder('WhatsApp')
    if (!order) return
    
    const shippingInfo = `🚚 *Envío:* ${freeShipping ? 'Gratis' : formatPrice(finalShipping)}\n⏱️ *Tiempo de entrega:* ${deliveryTime}`
    
    const message = `🛒 *Nuevo Pedido de CREART*\n\n${cart.map(item => 
      `• ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`
    ).join('\n')}\n\n📦 *Subtotal: ${formatPrice(cartSubtotal)}\n💰 IVA: ${formatPrice(cartIVA)}\n🚚 Envío: ${freeShipping ? 'Gratis' : formatPrice(finalShipping)}\n\n💵 *Total: ${formatPrice(totalWithShipping)}*\n\n👤 *Datos del cliente:*\n• Nombre: ${customerData.name}\n• Teléfono: ${customerData.phone}\n• Email: ${customerData.email || 'No especificado'}\n• Dirección: ${customerData.address}\n\n📋 *Pedido ID:* ${orderId}\n\n${shippingInfo}`
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleCheckoutWeb = () => {
    const order = saveOrder('WhatsApp Web')
    if (!order) return
    
    const shippingInfo = `🚚 *Envío:* ${freeShipping ? 'Gratis' : formatPrice(finalShipping)}\n⏱️ *Tiempo de entrega:* ${deliveryTime}`
    
    const message = `🛒 *Nuevo Pedido de CREART*\n\n${cart.map(item => 
      `• ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`
    ).join('\n')}\n\n📦 *Subtotal: ${formatPrice(cartSubtotal)}\n💰 IVA: ${formatPrice(cartIVA)}\n🚚 Envío: ${freeShipping ? 'Gratis' : formatPrice(finalShipping)}\n\n💵 *Total: ${formatPrice(totalWithShipping)}*\n\n👤 *Datos del cliente:*\n• Nombre: ${customerData.name}\n• Teléfono: ${customerData.phone}\n• Email: ${customerData.email || 'No especificado'}\n• Dirección: ${customerData.address}\n\n📋 *Pedido ID:* ${orderId}\n\n${shippingInfo}`
    
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleTransferCheckout = () => {
    const order = saveOrder('Transferencia Bancaria')
    if (!order) return
    
    const shippingInfo = `🚚 *Envío:* ${freeShipping ? 'Gratis' : formatPrice(finalShipping)}\n⏱️ *Tiempo de entrega:* ${deliveryTime}`
    
    const message = `🛒 *Nuevo Pedido - Transferencia Bancaria*\n\n${cart.map(item => 
      `• ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`
    ).join('\n')}\n\n📦 *Subtotal: ${formatPrice(cartSubtotal)}\n💰 IVA: ${formatPrice(cartIVA)}\n🚚 Envío: ${freeShipping ? 'Gratis' : formatPrice(finalShipping)}\n\n💵 *Total: ${formatPrice(totalWithShipping)}*\n\n👤 *Datos del cliente:*\n• Nombre: ${customerData.name}\n• Teléfono: ${customerData.phone}\n• Email: ${customerData.email || 'No especificado'}\n• Dirección: ${customerData.address}\n\n💳 *Método de pago: Transferencia Bancaria*\n📋 *Pedido ID:* ${orderId}\n\n*Por favor contacta al vendedor para recibir los datos de transferencia.*\n\n${shippingInfo}`
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  const handleCashCheckout = () => {
    const order = saveOrder('Contra Entrega')
    if (!order) return
    
    const shippingInfo = `🚚 *Envío:* ${freeShipping ? 'Gratis' : formatPrice(finalShipping)}\n⏱️ *Tiempo de entrega:* ${deliveryTime}`
    
    const message = `🛒 *Nuevo Pedido - Contra Entrega*\n\n${cart.map(item => 
      `• ${item.name} x${item.quantity}: ${formatPrice(item.price * item.quantity)}`
    ).join('\n')}\n\n📦 *Subtotal: ${formatPrice(cartSubtotal)}\n💰 IVA: ${formatPrice(cartIVA)}\n🚚 Envío: ${freeShipping ? 'Gratis' : formatPrice(finalShipping)}\n\n💵 *Total: ${formatPrice(totalWithShipping)}*\n\n👤 *Datos del cliente:*\n• Nombre: ${customerData.name}\n• Teléfono: ${customerData.phone}\n• Email: ${customerData.email || 'No especificado'}\n• Dirección: ${customerData.address}\n\n💵 *Método de pago: Contra Entrega*\n📋 *Pedido ID:* ${orderId}\n\n${shippingInfo}`
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')
  }

  if (cart.length === 0 && !orderConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-teal-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-teal-600" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-gray-800">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-8 text-lg">Explora nuestro catálogo y encuentra los muebles perfectos para tu hogar.</p>
            <Link to="/catalog" className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-10 rounded-full font-bold text-lg hover:from-teal-700 hover:to-teal-800 transition transform hover:scale-105 shadow-lg">
              🛍️ Ver Catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-10 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle className="w-14 h-14 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-3 text-gray-800">¡Pedido Confirmado!</h2>
            <p className="text-gray-600 mb-4 text-lg">Tu pedido ha sido recibido correctamente.</p>
            <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-4 mb-6">
              <p className="text-lg font-semibold text-gray-700">Número de pedido:</p>
              <p className="text-2xl font-bold text-teal-600">{orderId}</p>
            </div>
            <p className="text-sm text-gray-500 mb-8">Te contactaremos pronto para confirmar los detalles de entrega.</p>
            <div className="space-y-3">
              <Link to="/catalog" className="block bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 px-8 rounded-full font-bold hover:from-teal-700 hover:to-teal-800 transition">
                Seguir Comprando
              </Link>
              <Link to="/orders" className="block bg-gray-100 text-gray-700 py-3 px-8 rounded-full font-medium hover:bg-gray-200 transition">
                Ver Mis Pedidos
              </Link>
            </div>
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
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-1 md:mb-2">🛒 Carrito</h1>
          <p className="text-gray-600 text-sm md:text-base">Revisa tus productos</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
          {/* Columna izquierda: Productos y Datos (8 columnas) */}
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
            
            {/* Lista de Productos */}
            <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-3 md:p-6">
                <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 md:w-6 md:h-6" />
                  Productos ({cart.length})
                </h2>
              </div>
               
              <div className="p-2 md:p-6 space-y-3 md:space-y-6">
                {cart.map((item, index) => (
                  <div key={item.id} className={`flex gap-2 md:gap-4 pb-3 md:pb-6 ${index !== cart.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    {/* Imagen */}
                    <div className="w-20 h-20 md:w-28 md:h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl md:text-4xl">🪑</span>
                      )}
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm md:text-lg text-gray-800 mb-0.5 md:mb-1 truncate">{item.name}</h3>
                      <p className="text-teal-600 font-bold text-base md:text-xl mb-2 md:mb-3">{formatPrice(item.price)}</p>
                      
                      {/* Controles de cantidad */}
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="flex items-center bg-gray-100 rounded-full p-0.5 md:p-1">
                          <button 
                            onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition shadow-sm active:scale-95"
                          >
                            <Minus className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                          <span className="text-base md:text-lg font-bold w-8 md:w-12 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-200 transition shadow-sm active:scale-95"
                          >
                            <Plus className="w-3 h-3 md:w-4 md:h-4" />
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1 md:py-2 text-red-500 hover:bg-red-50 rounded-full transition"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          <span className="text-xs md:text-sm font-medium hidden sm:inline">Eliminar</span>
                        </button>
                      </div>
                    </div>
                    
                    {/* Subtotal */}
                    <div className="text-right flex flex-col justify-center flex-shrink-0">
                      <p className="text-xs md:text-sm text-gray-500 mb-0.5 md:mb-1">Subtotal</p>
                      <p className="font-bold text-base md:text-2xl text-gray-800">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Datos de Envío */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <MapPin className="w-6 h-6" />
                  Datos de Envío
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo *</label>
                    <input
                      type="text"
                      value={customerData.name}
                      onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                    <input
                      type="tel"
                      value={customerData.phone}
                      onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="+57 300 123 4567"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={customerData.email}
                      onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cédula o NIT</label>
                    <input
                      type="text"
                      value={customerData.cedula}
                      onChange={(e) => setCustomerData({ ...customerData, cedula: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="Para facturación"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección de entrega *</label>
                    <input
                      type="text"
                      value={customerData.address}
                      onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      placeholder="Calle, número, barrio, ciudad"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notas de entrega</label>
                    <textarea
                      value={customerData.notes}
                      onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
                      rows={2}
                      placeholder="Instrucciones especiales para la entrega"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-6 h-6" />
                  Método de Pago
                </h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {storeSettings.paymentWhatsapp && (
                    <label className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition ${selectedPayment === 'whatsapp' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="whatsapp"
                        checked={selectedPayment === 'whatsapp'}
                        onChange={() => setSelectedPayment('whatsapp')}
                        className="w-5 h-5 text-green-600"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-lg block">WhatsApp</span>
                        <p className="text-sm text-gray-500">Te contactaremos para confirmar</p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fab fa-whatsapp text-green-600 text-2xl"></i>
                      </div>
                    </label>
                  )}
                  
                  {storeSettings.paymentTransfer && (
                    <label className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition ${selectedPayment === 'transferencia' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="transferencia"
                        checked={selectedPayment === 'transferencia'}
                        onChange={() => setSelectedPayment('transferencia')}
                        className="w-5 h-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-lg block">Transferencia</span>
                        <p className="text-sm text-gray-500">Datos bancarios</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-university text-blue-600 text-xl"></i>
                      </div>
                    </label>
                  )}
                  
                  {storeSettings.paymentCash && (
                    <label className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition ${selectedPayment === 'contraentrega' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <input
                        type="radio"
                        name="payment"
                        value="contraentrega"
                        checked={selectedPayment === 'contraentrega'}
                        onChange={() => setSelectedPayment('contraentrega')}
                        className="w-5 h-5 text-amber-600"
                      />
                      <div className="flex-1">
                        <span className="font-bold text-lg block">Contra Entrega</span>
                        <p className="text-sm text-gray-500">Pagas al recibir</p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-hand-holding-usd text-amber-600 text-xl"></i>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: Resumen (4 columnas) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              
              {/* Card de Resumen */}
              <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6">
                  <h2 className="text-xl font-bold text-white">Resumen del Pedido</h2>
                </div>
                
                <div className="p-6">
                  {/* Info de envío gratis */}
                  {minOrder > 0 && (
                    <div className={`rounded-2xl p-4 mb-6 ${freeShipping ? 'bg-green-100 border-2 border-green-300' : 'bg-blue-50 border-2 border-blue-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${freeShipping ? 'bg-green-500' : 'bg-blue-500'}`}>
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-bold ${freeShipping ? 'text-green-700' : 'text-blue-700'}`}>
                            {freeShipping ? '🎉 ¡Envío Gratis!' : `Faltan ${formatPrice(minOrder - cartSubtotal)}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {freeShipping ? 'Tu pedido califica' : `para envío gratis (min: ${formatPrice(minOrder)})`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Totales */}
                  <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                    <div className="flex justify-between text-sm md:text-base text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-medium">{formatPrice(cartSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm md:text-base text-gray-600">
                      <span>IVA (19%)</span>
                      <span className="font-medium">{formatPrice(cartIVA)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm md:text-base text-gray-600">Envío</span>
                      <span className={`font-bold text-sm md:text-base ${freeShipping ? 'text-green-600' : 'text-gray-800'}`}>
                        {freeShipping ? 'Gratis' : formatPrice(finalShipping)}
                      </span>
                    </div>
                    {deliveryTime && (
                      <div className="flex justify-between text-xs md:text-sm text-gray-500">
                        <span>Entrega estimada</span>
                        <span>{deliveryTime}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-gray-100 pt-2 md:pt-4 mt-2 md:mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-base md:text-xl font-bold text-gray-800">Total</span>
                        <span className="text-xl md:text-3xl font-bold text-teal-600">{formatPrice(totalWithShipping)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Botón de Pagar */}
                  {selectedPayment ? (
                    <button 
                      onClick={() => {
                        if (selectedPayment === 'whatsapp') handleCheckout()
                        else if (selectedPayment === 'whatsapp-web') handleCheckoutWeb()
                        else if (selectedPayment === 'transferencia') handleTransferCheckout()
                        else if (selectedPayment === 'contraentrega') handleCashCheckout()
                      }}
                      className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-2xl font-bold text-lg hover:from-teal-700 hover:to-teal-800 transition transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3"
                    >
                      <i className="fab fa-whatsapp text-2xl"></i>
                      Confirmar Pedido
                    </button>
                  ) : (
                    <div className="w-full bg-gray-200 text-gray-400 py-4 rounded-2xl font-bold text-lg text-center cursor-not-allowed">
                      Selecciona método de pago
                    </div>
                  )}
                  
                  {/* Botón vaciar carrito */}
                  <button 
                    onClick={clearCart}
                    className="w-full mt-4 bg-gray-100 text-gray-600 py-3 rounded-2xl font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Vaciar Carrito
                  </button>
                </div>
              </div>

              {/* Beneficios */}
              <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-3xl shadow-xl p-6 text-white">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6" />
                  Compra con Confianza
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-sm"></i>
                    </div>
                    <span className="text-sm">Pago seguro</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-truck text-sm"></i>
                    </div>
                    <span className="text-sm">Envío a domicilio</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="fas fa-undo text-sm"></i>
                    </div>
                    <span className="text-sm">Garantía de calidad</span>
                  </div>
                </div>
              </div>

              {/* Políticas */}
              {(storeSettings.returnPolicy || storeSettings.terms || storeSettings.privacy) && (
                <div className="bg-white rounded-3xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-teal-600" />
                    Información Importante
                  </h3>
                  <div className="space-y-2">
                    {storeSettings.returnPolicy && (
                      <Link to="/policies" className="block text-sm text-teal-600 hover:underline">
                        📄 Políticas de Devolución
                      </Link>
                    )}
                    {storeSettings.terms && (
                      <Link to="/terms" className="block text-sm text-teal-600 hover:underline">
                        📋 Términos y Condiciones
                      </Link>
                    )}
                    {storeSettings.privacy && (
                      <Link to="/privacy" className="block text-sm text-teal-600 hover:underline">
                        🔒 Política de Privacidad
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
