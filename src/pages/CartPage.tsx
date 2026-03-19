import { Link } from 'react-router'
import { Minus, Plus, Trash2, CheckCircle, ShoppingBag, MapPin, CreditCard, Truck, ShieldCheck, Gift, X, XCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect, useRef } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '../firebase'

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal, cartIVA, cartTotal, clearCart, customer, storeSettings, user, loadCustomer, addOrder, setCustomer, saveCustomer } = useApp()
  const { user: authUser, customer: authCustomer } = useAuth()
  
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
    // Combinar datos del usuario de ambos contextos
    const userData = authUser || user
    const customerDataSource = authCustomer || customer
    
    setCustomerData(prev => ({
      ...prev,
      name: customerDataSource.name || userData?.name || prev.name,
      phone: customerDataSource.phone || prev.phone,
      address: customerDataSource.address || prev.address,
      email: userData?.email || customerDataSource.email || prev.email,
    }))
  }, [user, customer, authUser, authCustomer])
  
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
      email: customerData.email || authUser?.email || '',
      cedula: customerData.cedula,
      notes: customerData.notes,
      paymentMethod: paymentMethod,
    }, authUser?.email)
    
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

  // MercadoPago - Estado para Checkout API (sin redirect)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [showMercadoPagoForm, setShowMercadoPagoForm] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'form' | 'processing' | 'success' | 'error'>('form')
  const cardFormRef = useRef<any>(null)
  const [mercadoPagoReady, setMercadoPagoReady] = useState(false)

  // Inicializar MercadoPago cuando se muestra el formulario
  useEffect(() => {
    if (showMercadoPagoForm) {
      // Pequeño delay para asegurar que el DOM esté listo
      const timer = setTimeout(() => {
        initializeMercadoPago()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [showMercadoPagoForm])

  // Estado para los datos de la tarjeta
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardExpirationMonth: '',
    cardExpirationYear: '',
    cardCVV: '',
    cardholderName: '',
    cardholderEmail: '',
    docType: 'CC',
    docNumber: ''
  })

  // Verificar si el SDK de MercadoPago está cargado
  const initializeMercadoPago = async () => {
    // Verificar que el SDK esté disponible
    if (typeof window !== 'undefined' && (window as any).MercadoPago) {
      console.log('✅ SDK de MercadoPago cargado correctamente')
      setMercadoPagoReady(true)
    } else {
      console.error('❌ SDK de MercadoPago no está cargado')
      // Intentar cargar el SDK dinámicamente
      const script = document.createElement('script')
      script.src = 'https://sdk.mercadopago.com/js/v2'
      script.onload = () => {
        console.log('✅ SDK cargado dinámicamente')
        setMercadoPagoReady(true)
      }
      script.onerror = () => {
        console.error('❌ Error al cargar el SDK de MercadoPago')
        alert('Error al cargar el sistema de pagos. Por favor recarga la página.')
      }
      document.head.appendChild(script)
    }
  }

  // Submit payment - Procesar pago y guardar en Realtime Database
  const submitPayment = async (
    token: string, 
    paymentMethodId: string, 
    itemsCart: any[], 
    totalAmount: number, 
    customerInfo: any,
    securityCode?: string
  ) => {
    console.log('submitPayment llamado con:', { token, paymentMethodId, total: totalAmount, securityCode })
    console.log('Items recibidos:', itemsCart)
    
    setPaymentStep('processing')
    
    try {
      const functions = getFunctions(app)
      const processPaymentFn = httpsCallable(functions, 'processPayment')
      
      console.log('Card items:', itemsCart)
      console.log('Cart length:', itemsCart.length)
      console.log('Customer data:', customerInfo)
      console.log('Card CVV:', cardData.cardCVV)
      
      const orderId = `ORD-${Date.now()}`
      
      const paymentData = {
        token,
        paymentMethodId: paymentMethodId || 'visa',
        transactionAmount: totalAmount,
        securityCode: securityCode || '',
        description: `Compra en CREART - ${itemsCart.length} producto(s)`,
        payer: {
          email: customerInfo.email || 'cliente@correo.com',
          identification: {
            type: 'CC',
            number: customerInfo.cedula || '00000000'
          }
        },
        externalReference: orderId,
        items: itemsCart.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        customer: {
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address
        }
      }
      
      console.log('Enviando pago a Cloud Function...', paymentData)
      
      // Enviar datos a processPayment
      const result = await processPaymentFn(paymentData) as { data: { status: string; message?: string; paymentId?: string; statusDetail?: string } }
      console.log('Resultado del pago:', result.data)
      
      const paymentResult = result.data
      
      if (paymentResult.status === 'approved') {
        // También guardar en Firestore para compatibilidad con el panel admin
        addOrder(itemsCart, totalAmount, customerInfo.address, {
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email || '',
          cedula: customerInfo.cedula,
          notes: customerInfo.notes,
          paymentMethod: 'MercadoPago',
        }, authUser?.email)
        
        setOrderId(orderId)
        setPaymentStep('success')
        clearCart()
      } else {
        setPaymentStep('error')
        alert('Pago rechazado: ' + (paymentResult.message || 'Intenta con otra tarjeta'))
      }
      
    } catch (error: any) {
      console.error('Error:', error)
      setPaymentStep('error')
      alert('Error al procesar el pago: ' + error.message)
    }
  }

  // Checkout Pro - Redirigir a MercadoPago
  const handleMercadoPagoCheckout = async () => {
    if (!customerData.name.trim() || !customerData.phone.trim() || !customerData.address.trim()) {
      alert('Por favor completa todos los datos de envío')
      return
    }

    try {
      setIsProcessingPayment(true)
      
      const currentCart = [...cart]
      const currentTotal = totalWithShipping
      
      if (currentCart.length === 0) {
        alert('El carrito está vacío')
        setIsProcessingPayment(false)
        return
      }
      
      // Llamar a la Cloud Function para crear preferencia
      const { getFunctions, httpsCallable } = await import('firebase/functions')
      const functions = getFunctions()
      const createPreference = httpsCallable(functions, 'createPaymentPreference')
      
      const orderId = `ORD-${Date.now()}`
      
      console.log('Enviando datos:', {
        items: currentCart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        customer: customerData,
        orderId: orderId
      })
      
      // Enviar datos directamente sin wrapper 'data'
      const result = await createPreference({
        items: currentCart.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        customer: customerData,
        orderId: orderId
      })
      
      console.log('Resultado:', result)
      
      // La respuesta viene en result.data
      const responseData = (result as any).data
      if (responseData?.initPoint) {
        window.location.href = responseData.initPoint
      } else if (responseData?.sandbox_init_point) {
        window.location.href = responseData.sandbox_init_point
      } else {
        console.error('No se recibió initPoint:', responseData)
        alert('Error al crear la preferencia de pago')
        setIsProcessingPayment(false)
      }
    } catch (error: any) {
      console.error('Error completo:', error)
      alert('Error al procesar el pago: ' + (error?.message || 'Por favor intenta de nuevo.'))
      setIsProcessingPayment(false)
    }
  }

  // Función para procesar pago directo con tarjeta (Checkout API)
  const handleCardPayment = async () => {
    // Validar datos primero
    if (!customerData.name.trim() || !customerData.phone.trim() || !customerData.address.trim()) {
      alert('Por favor completa todos los datos de envío')
      return
    }
    
    // Validar datos de tarjeta
    if (!cardData.cardNumber.trim() || !cardData.cardExpirationMonth.trim() || 
        !cardData.cardExpirationYear.trim() || !cardData.cardCVV.trim() ||
        !cardData.cardholderName.trim() || !cardData.cardholderEmail.trim() ||
        !cardData.docNumber.trim()) {
      alert('Por favor completa todos los datos de la tarjeta')
      return
    }

    setPaymentStep('processing')
    
    try {
      // Inicializar MercadoPago SDK si no está listo
      if (!(window as any).MercadoPago) {
        const script = document.createElement('script')
        script.src = 'https://sdk.mercadopago.com/js/v2'
        document.head.appendChild(script)
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }
      
      const mp = new (window as any).MercadoPago('TEST-c17fda90-bf0c-42da-876c-d27444f51979')
      
      console.log('=== ENVIANDO DATOS AL BACKEND ===')
      console.log(' paymentData a enviar:', JSON.stringify({
        cardData: {
          cardNumber: cardData.cardNumber.replace(/\s/g, ''),
          cardholderName: cardData.cardholderName,
          identificationType: cardData.docType,
          identificationNumber: cardData.docNumber,
          securityCode: cardData.cardCVV,
          expirationMonth: cardData.cardExpirationMonth,
          expirationYear: cardData.cardExpirationYear
        },
        transactionAmount: totalWithShipping
      }))
      
      // Ahora llamar a la función de Firebase - el backend crea el token
      const functions = getFunctions(app)
      const processPaymentFn = httpsCallable(functions, 'processPayment')
      
      const orderId = `ORD-${Date.now()}`
      
      // Asegurar que haya un email válido
      const payerEmail = cardData.cardholderEmail || customerData.email || 'cliente@creart.com'
      
      // Enviar datos de la tarjeta al backend - el backend crea el token
      const paymentData = {
        data: {  // Firebase callable envuelve en 'data'
          // Datos de la tarjeta para crear token en backend
          cardData: {
            cardNumber: cardData.cardNumber.replace(/\s/g, ''),
            cardholderName: cardData.cardholderName,
            identificationType: cardData.docType,
            identificationNumber: cardData.docNumber,
            securityCode: cardData.cardCVV,
            expirationMonth: cardData.cardExpirationMonth,
            expirationYear: cardData.cardExpirationYear
          },
          transactionAmount: totalWithShipping,
          description: `Compra en CREART - ${cart.length} producto(s)`,
          payer: {
            email: payerEmail,
            first_name: customerData.name.split(' ')[0] || 'Cliente',
            last_name: customerData.name.split(' ').slice(1).join(' ') || 'Apellido',
            identification: {
              type: cardData.docType,
              number: cardData.docNumber
            }
          },
          externalReference: orderId,
          items: cart.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price
          })),
          customer: {
            name: customerData.name,
            phone: customerData.phone,
            address: customerData.address
          }
        }
      }
      
      console.log('Enviando pago a Cloud Function...', paymentData)
      console.log('Expiration datos:', cardData.cardExpirationMonth, cardData.cardExpirationYear)
      
      const result = await processPaymentFn(paymentData)
      console.log('Resultado del pago:', result)
      
      const paymentResult = (result as any).data
      
      if (paymentResult.status === 'approved') {
        // Guardar orden en Firestore
        addOrder(cart, totalWithShipping, customerData.address, {
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email || '',
          cedula: customerData.cedula,
          notes: customerData.notes,
          paymentMethod: 'MercadoPago',
        }, authUser?.email)
        
        setOrderId(orderId)
        setPaymentStep('success')
        clearCart()
      } else {
        setPaymentStep('error')
        const errorMsg = paymentResult.message || paymentResult.statusDetail || 'Intenta con otra tarjeta'
        
        // Si el pago directo falla, sugerir Checkout Pro
        if (errorMsg.includes('rejected') || errorMsg.includes('other_reason')) {
          alert('El pago con tarjeta fue rechazado. Te recomendamos usar la opción "MercadoPago" que te redirigirá a una página segura de pagos.')
        } else {
          alert('Pago rechazado: ' + errorMsg)
        }
      }
      
    } catch (error: any) {
      console.error('Error completo:', error)
      setPaymentStep('error')
      // Sugerir Checkout Pro si hay error de conexión o tarjeta
      const errorMsg = error.message || ''
      if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('card')) {
        alert('Error de conexión con el pago. Te recomendamos usar "MercadoPago" (redirect) para una experiencia más confiable.')
      } else {
        alert('Error al procesar el pago: ' + (error.message || 'Por favor intenta con otra tarjeta'))
      }
    }
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
                  
                  {/* MercadoPago - Checkout Pro (Redirect) */}
                  <label className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition ${selectedPayment === 'mercadopago' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="mercadopago"
                      checked={selectedPayment === 'mercadopago'}
                      onChange={() => setSelectedPayment('mercadopago')}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-lg block">MercadoPago</span>
                      <p className="text-sm text-gray-500">Redirect a MercadoPago - Recomendado</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="w-8 h-8">
                        <rect width="100" height="100" rx="20" fill="#009EE3"/>
                        <text x="50" y="65" textAnchor="middle" fill="white" fontSize="40" fontWeight="bold">M</text>
                      </svg>
                    </div>
                  </label>

                  {/* MercadoPago - Checkout API (Direct card) */}
                  <label className={`flex items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition ${selectedPayment === 'mercadopago_direct' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="mercadopago_direct"
                      checked={selectedPayment === 'mercadopago_direct'}
                      onChange={() => {
                        setSelectedPayment('mercadopago_direct')
                        setShowMercadoPagoForm(true)
                      }}
                      className="w-5 h-5 text-purple-600"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-lg block">Pago con Tarjeta</span>
                      <p className="text-sm text-gray-500">Ingresa los datos de tu tarjeta directamente</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-purple-600" />
                    </div>
                  </label>
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
                        else if (selectedPayment === 'mercadopago') handleMercadoPagoCheckout()
                        else if (selectedPayment === 'mercadopago_direct') {
                          // Validar datos de envío primero
                          if (!customerData.name.trim() || !customerData.phone.trim() || !customerData.address.trim()) {
                            alert('Por favor completa todos los datos de envío')
                            return
                          }
                          setShowMercadoPagoForm(true)
                        }
                      }}
                      disabled={isProcessingPayment}
                      className={`w-full text-white py-4 rounded-2xl font-bold text-lg transition transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-3 ${
                        selectedPayment === 'mercadopago' || selectedPayment === 'mercadopago_direct'
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                          : 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800'
                      } ${isProcessingPayment ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {isProcessingPayment ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Procesando...
                        </>
                      ) : selectedPayment === 'mercadopago' ? (
                        <>
                          <svg viewBox="0 0 100 100" className="w-6 h-6">
                            <rect width="100" height="100" rx="20" fill="white"/>
                            <text x="50" y="65" textAnchor="middle" fill="#009EE3" fontSize="40" fontWeight="bold">M</text>
                          </svg>
                          Pagar con MercadoPago
                        </>
                      ) : selectedPayment === 'mercadopago_direct' ? (
                        <>
                          <CreditCard className="w-6 h-6" />
                          Pagar con Tarjeta
                        </>
                      ) : (
                        <>
                          <i className="fab fa-whatsapp text-2xl"></i>
                          Confirmar Pedido
                        </>
                      )}
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

      {/* MercadoPago Payment Modal - Checkout API (Sin redirect) */}
      {showMercadoPagoForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-3xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 100 100" className="w-10 h-10">
                  <rect width="100" height="100" rx="20" fill="white"/>
                  <text x="50" y="65" textAnchor="middle" fill="#009EE3" fontSize="40" fontWeight="bold">M</text>
                </svg>
                <div>
                  <h3 className="text-white font-bold text-lg">Pago con MercadoPago</h3>
                  <p className="text-blue-100 text-sm">Total: ${totalWithShipping.toLocaleString('es-CO')}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowMercadoPagoForm(false)}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {paymentStep === 'form' && (
                <>
                  {/* Formulario de tarjeta - Campos simples */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de tarjeta
                      </label>
                      <input
                        type="text"
                        maxLength={19}
                        value={cardData.cardNumber}
                        onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mes (MM)
                        </label>
                        <input
                          type="text"
                          maxLength={2}
                          value={cardData.cardExpirationMonth}
                          onChange={(e) => setCardData({...cardData, cardExpirationMonth: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                          placeholder="12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Año (AA)
                        </label>
                        <input
                          type="text"
                          maxLength={2}
                          value={cardData.cardExpirationYear}
                          onChange={(e) => setCardData({...cardData, cardExpirationYear: e.target.value})}
                          className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                          placeholder="25"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={cardData.cardCVV}
                        onChange={(e) => setCardData({...cardData, cardCVV: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        placeholder="123"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del titular
                      </label>
                      <input
                        type="text"
                        value={cardData.cardholderName}
                        onChange={(e) => setCardData({...cardData, cardholderName: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        placeholder="Nombre como aparece en la tarjeta"
                        defaultValue={customerData.name}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={cardData.cardholderEmail}
                        onChange={(e) => setCardData({...cardData, cardholderEmail: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        placeholder="tu@email.com"
                        defaultValue={customerData.email}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de documento
                      </label>
                      <select
                        value={cardData.docType}
                        onChange={(e) => setCardData({...cardData, docType: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                      >
                        <option value="CC">Cédula de ciudadanía</option>
                        <option value="CE">Cédula de extranjería</option>
                        <option value="NIT">NIT</option>
                        <option value="PP">Pasaporte</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Número de documento
                      </label>
                      <input
                        type="text"
                        value={cardData.docNumber}
                        onChange={(e) => setCardData({...cardData, docNumber: e.target.value})}
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                        placeholder="Número de documento"
                        defaultValue={customerData.cedula}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleCardPayment}
                    disabled={!mercadoPagoReady}
                    className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50"
                  >
                    {mercadoPagoReady ? `Pagar $${totalWithShipping.toLocaleString('es-CO')}` : 'Cargando...'}
                  </button>

                  <p className="text-xs text-gray-500 mt-4 text-center flex items-center justify-center gap-1">
                    <CreditCard className="w-4 h-4" />
                    Tus datos están seguros con MercadoPago
                  </p>
                </>
              )}

              {paymentStep === 'processing' && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Procesando pago...</h3>
                  <p className="text-gray-600">Por favor espera mientras verificamos tu pago</p>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-green-600 mb-2">¡Pago exitoso!</h3>
                  <p className="text-gray-600 mb-6">Tu pago ha sido procesado correctamente.</p>
                  <button
                    onClick={() => {
                      setShowMercadoPagoForm(false)
                    }}
                    className="bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition"
                  >
                    Cerrar
                  </button>
                </div>
              )}

              {paymentStep === 'error' && (
                <div className="text-center py-12">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-red-600 mb-2">Error en el pago</h3>
                  <p className="text-gray-600 mb-4">El pago fue rechazado. Por favor intenta con otra tarjeta.</p>
                  <button
                    onClick={() => {
                      setPaymentStep('form')
                    }}
                    className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition"
                  >
                    Intentar de nuevo
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
