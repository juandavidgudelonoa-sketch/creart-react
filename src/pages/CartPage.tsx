import { Link } from 'react-router'
import { Minus, Plus, Trash2, CheckCircle, ShoppingBag } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useState, useEffect } from 'react'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal, cartIVA, cartTotal, clearCart, customer, storeSettings, user, loadCustomer, addOrder, setCustomer, saveCustomer } = useApp()
  
  // Cargar datos del cliente al inicio
  useEffect(() => {
    loadCustomer()
  }, [])
  
  // Estado para los datos del cliente
  // Si hay un usuario logueado, usar su email, si no usar los datos del cliente guardados
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
    cedula: '',
    notes: '',
  })
  
  // Actualizar customerData cuando cambie user o customer
  useEffect(() => {
    setCustomerData(prev => ({
      ...prev,
      name: customer.name || user?.name || prev.name,
      phone: customer.phone || prev.phone,
      address: customer.address || prev.address,
      email: user?.email || customer.email || prev.email,
    }))
  }, [user, customer])
  
  // Estado para mostrar confirmación de pedido
  const [orderConfirmed, setOrderConfirmed] = useState(false)
  const [orderId, setOrderId] = useState('')
  
  // Estado para método de pago seleccionado
  const [selectedPayment, setSelectedPayment] = useState<string>('')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Usar el WhatsApp de la configuración o el default
  const whatsappNumber = storeSettings.whatsapp?.replace(/\D/g, '') || '573159934696'

  // Configuración de pedidos - asegurar que sean números
  const minOrder = Number(storeSettings.minOrder) || 0
  const shippingCost = Number(storeSettings.shippingCost) || 0
  const deliveryTime = storeSettings.deliveryTime || '3-5 días hábiles'
  
  // Calcular si aplica envío gratis
  const freeShipping = minOrder > 0 && cartSubtotal >= minOrder
  const finalShipping = freeShipping ? 0 : shippingCost
  const totalWithShipping = cartTotal + finalShipping

  // Función para guardar pedido
  const saveOrder = (paymentMethod: string) => {
    if (cart.length === 0) return null
    
    // Validar datos del cliente
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
    
    // Crear ID de pedido
    const newOrderId = `ORD-${Date.now()}`
    
    // Usar addOrder del contexto con todos los datos del cliente
    addOrder(cart, totalWithShipping, customerData.address, {
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email,
      cedula: customerData.cedula,
      notes: customerData.notes,
      paymentMethod: paymentMethod,
    })
    
    // Guardar datos del cliente para futuras compras
    setCustomer({
      name: customerData.name,
      phone: customerData.phone,
      email: customerData.email,
      address: customerData.address
    })
    saveCustomer()
    
    // Limpiar carrito
    clearCart()
    
    // Mostrar confirmación
    setOrderId(newOrderId)
    setOrderConfirmed(true)
    
    return newOrderId
  }

  // Checkout con WhatsApp
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

  // Checkout con WhatsApp Web
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

  // Checkout con Transferencia
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

  // Checkout con Contra Entrega
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
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8">Explora nuestro catálogo y agrega productos.</p>
        <Link to="/catalog" className="inline-block bg-teal-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-teal-700 transition">
          Ver Catálogo
        </Link>
      </div>
    )
  }

  // Mostrar confirmación de pedido
  if (orderConfirmed) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-4">¡Pedido Confirmado!</h2>
          <p className="text-gray-600 mb-2">Tu pedido ha sido recibido correctamente.</p>
          <p className="text-lg font-semibold mb-4">Número de pedido: <span className="text-teal-600">{orderId}</span></p>
          <p className="text-sm text-gray-500 mb-6">Te contactaremos pronto para confirmar los detalles.</p>
          <div className="space-y-3">
            <Link to="/catalog" className="block bg-teal-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-teal-700 transition">
              Seguir Comprando
            </Link>
            <Link to="/orders" className="block bg-gray-200 text-gray-700 py-3 px-8 rounded-full font-medium hover:bg-gray-300 transition">
              Ver Mis Pedidos
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Datos y Pago */}
        <div className="lg:col-span-2 space-y-6">
          {/* Formulario de datos del cliente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Datos de Envío
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre completo *</label>
                <input
                  type="text"
                  value={customerData.name}
                  onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Teléfono *</label>
                <input
                  type="tel"
                  value={customerData.phone}
                  onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="+57 300 123 4567"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cédula o NIT</label>
                <input
                  type="text"
                  value={customerData.cedula}
                  onChange={(e) => setCustomerData({ ...customerData, cedula: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Opcional para facturación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notas de entrega</label>
                <textarea
                  value={customerData.notes}
                  onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  rows={1}
                  placeholder="Opcional: instrucciones especiales"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={customerData.email}
                  onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="tu@email.com (opcional)"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Dirección de entrega *</label>
                <input
                  type="text"
                  value={customerData.address}
                  onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                  className="w-full border rounded-lg px-4 py-2"
                  placeholder="Calle, número, barrio, ciudad"
                  required
                />
              </div>
            </div>
          </div>

          {/* Selección de método de pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Método de Pago</h2>
            <div className="space-y-3">
              {storeSettings.paymentWhatsapp && (
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${selectedPayment === 'whatsapp' ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="whatsapp"
                    checked={selectedPayment === 'whatsapp'}
                    onChange={() => setSelectedPayment('whatsapp')}
                    className="w-5 h-5"
                  />
                  <div>
                    <span className="font-medium">WhatsApp</span>
                    <p className="text-sm text-gray-500">Te contactaremos para confirmar el pedido</p>
                  </div>
                </label>
              )}
              
              {storeSettings.paymentWhatsapp && (
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${selectedPayment === 'whatsapp-web' ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="whatsapp-web"
                    checked={selectedPayment === 'whatsapp-web'}
                    onChange={() => setSelectedPayment('whatsapp-web')}
                    className="w-5 h-5"
                  />
                  <div>
                    <span className="font-medium">WhatsApp Web</span>
                    <p className="text-sm text-gray-500">Envía el pedido por WhatsApp Web</p>
                  </div>
                </label>
              )}
              
              {storeSettings.paymentTransfer && (
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${selectedPayment === 'transferencia' ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="transferencia"
                    checked={selectedPayment === 'transferencia'}
                    onChange={() => setSelectedPayment('transferencia')}
                    className="w-5 h-5"
                  />
                  <div>
                    <span className="font-medium">Transferencia Bancaria</span>
                    <p className="text-sm text-gray-500">Te enviaremos los datos para realizar la transferencia</p>
                  </div>
                </label>
              )}
              
              {storeSettings.paymentCash && (
                <label className={`flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition ${selectedPayment === 'contraentrega' ? 'border-amber-500 bg-amber-50' : 'hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="contraentrega"
                    checked={selectedPayment === 'contraentrega'}
                    onChange={() => setSelectedPayment('contraentrega')}
                    className="w-5 h-5"
                  />
                  <div>
                    <span className="font-medium"> Contra Entrega</span>
                    <p className="text-sm text-gray-500">Pagas cuando recibes el producto</p>
                  </div>
                </label>
              )}
            </div>

            {/* Botón de Pagar Ahora */}
            {selectedPayment && (
              <div className="mt-6 pt-4 border-t">
                <button 
                  onClick={() => {
                    if (selectedPayment === 'whatsapp') handleCheckout()
                    else if (selectedPayment === 'whatsapp-web') handleCheckoutWeb()
                    else if (selectedPayment === 'transferencia') handleTransferCheckout()
                    else if (selectedPayment === 'contraentrega') handleCashCheckout()
                  }}
                  className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 rounded-lg font-bold text-lg hover:from-teal-700 hover:to-teal-800 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                  Pagar Ahora
                </button>
                <p className="text-center text-sm text-gray-500 mt-2">
                  Total a pagar: {formatPrice(totalWithShipping)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Columna derecha: Resumen y Productos */}
        <div className="space-y-6">
          {/* Resumen del pedido */}
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
            
            {/* Info de configuración */}
            {minOrder > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
                <p className="text-blue-700">📦 Pedido mínimo para envío gratis: {formatPrice(minOrder)}</p>
                <p className="text-blue-600 text-xs">Tu pedido actual: {formatPrice(cartSubtotal)}</p>
                {cartSubtotal < minOrder && (
                  <p className="text-orange-600 text-xs mt-1">
                    Faltan {formatPrice(minOrder - cartSubtotal)} para envío gratis
                  </p>
                )}
              </div>
            )}
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (19%):</span>
                <span>{formatPrice(cartIVA)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío:</span>
                <span className={freeShipping ? 'text-green-600 font-medium' : ''}>
                  {freeShipping ? 'Gratis' : formatPrice(finalShipping)}
                </span>
              </div>
              {deliveryTime && (
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Tiempo de entrega:</span>
                  <span>{deliveryTime}</span>
                </div>
              )}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-teal-600">{formatPrice(totalWithShipping)}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={clearCart}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Vaciar Carrito
            </button>

            {/* Políticas de confianza */}
            {(storeSettings.returnPolicy || storeSettings.terms || storeSettings.privacy) && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-center gap-2 mb-3 text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                  </svg>
                  <span className="text-sm font-medium">Compra 100% segura</span>
                </div>
                <div className="flex flex-wrap justify-center gap-3 text-xs">
                  {storeSettings.returnPolicy && (
                    <Link to="/policies" className="text-teal-600 hover:underline">
                      📄 Políticas de Devolución
                    </Link>
                  )}
                  {storeSettings.terms && (
                    <Link to="/terms" className="text-teal-600 hover:underline">
                      📋 Términos y Condiciones
                    </Link>
                  )}
                  {storeSettings.privacy && (
                    <Link to="/privacy" className="text-teal-600 hover:underline">
                      🔒 Política de Privacidad
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Productos en el carrito */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Productos ({cart.length})</h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <span className="text-2xl">🪑</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    <p className="text-teal-600 font-bold text-sm">{formatPrice(item.price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 text-xs"
                      >
                        -
                      </button>
                      <span className="text-sm w-6 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 text-xs"
                      >
                        +
                      </button>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
