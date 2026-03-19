import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { CheckCircle, Package, Truck, Mail, Home, ShoppingBag, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore'
import { app } from '../firebase'

export default function SuccessPage() {
  const { clearCart, customer, storeSettings, addOrder } = useApp()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  
  const paymentId = searchParams.get('payment_id')
  const preferenceId = searchParams.get('preference_id')
  const externalReference = searchParams.get('external_reference')

  useEffect(() => {
    // Verificar y actualizar la orden en Firestore
    const verifyOrder = async () => {
      if (externalReference && paymentId) {
        try {
          const db = getFirestore(app)
          const orderRef = doc(db, 'orders', externalReference)
          const orderSnap = await getDoc(orderRef)
          
          if (orderSnap.exists()) {
            const orderData = orderSnap.data()
            // Si la orden existe y está marcada como paid, guardarla en localStorage también
            if (orderData.paymentStatus === 'approved' || orderData.status === 'paid') {
              // Guardar también en localStorage para el panel admin
              const orderForLocal = {
                id: externalReference,
                date: new Date().toLocaleDateString('es-CO'),
                items: orderData.items || [],
                total: orderData.total || 0,
                status: 'completed',
                shippingAddress: orderData.customer?.address || '',
                customerName: orderData.customer?.name || '',
                customerPhone: orderData.customer?.phone || '',
                customerEmail: orderData.customer?.email || '',
                paymentMethod: 'MercadoPago',
                paymentId: paymentId
              }
              // Agregar a localStorage
              addOrder(orderForLocal.items, orderForLocal.total, orderForLocal.shippingAddress, {
                name: orderForLocal.customerName,
                phone: orderForLocal.customerPhone,
                email: orderForLocal.customerEmail,
                paymentMethod: 'MercadoPago'
              })
            }
          }
        } catch (error) {
          console.error('Error verificando orden:', error)
        }
      }
      
      // Limpiar el carrito cuando llega a la página de éxito
      clearCart()
      setLoading(false)
    }

    verifyOrder()
  }, [externalReference, paymentId, clearCart, addOrder])

  const storeName = storeSettings?.storeName || 'CREART'

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header verde */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-14 h-14 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">¡Pago Aprobado!</h1>
            <p className="text-green-100 text-lg">Tu pedido ha sido confirmado</p>
          </div>

          {/* Contenido */}
          <div className="p-8">
            {/* Mensaje de confirmación */}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg">
                Gracias por tu compra en <strong>{storeName}</strong>. 
                Tu pedido está siendo procesado y pronto recibirás más información.
              </p>
            </div>

            {/* Información del pago */}
            {paymentId && (
              <div className="bg-green-50 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Detalles del pago
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de Pago:</span>
                    <span className="font-mono text-gray-800">{paymentId}</span>
                  </div>
                  {externalReference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Referencia:</span>
                      <span className="font-mono text-gray-800">{externalReference}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pasos del proceso */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Confirmación por email</h4>
                  <p className="text-gray-500 text-sm">
                    Recibirás un correo electrónico con los detalles de tu pedido.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Preparación del pedido</h4>
                  <p className="text-gray-500 text-sm">
                    Nuestro equipo preparará tu muebles con el mayor cuidado.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">Envío a domicilio</h4>
                  <p className="text-gray-500 text-sm">
                    Te notificaremos cuando tu pedido esté en camino.
                  </p>
                </div>
              </div>
            </div>

            {/* Información del cliente */}
            {customer && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-gray-800 mb-3">Datos de envío</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Nombre:</span>
                    <span className="font-medium">{customer.name}</span>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Teléfono:</span>
                      <span className="font-medium">{customer.phone}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{customer.address}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/catalog"
                className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-6 rounded-2xl font-bold text-center hover:from-teal-700 hover:to-teal-800 transition flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Seguir comprando
              </Link>
              <Link 
                to="/orders"
                className="flex-1 bg-gray-100 text-gray-700 py-4 px-6 rounded-2xl font-bold text-center hover:bg-gray-200 transition flex items-center justify-center gap-2"
              >
                <Package className="w-5 h-5" />
                Ver mis pedidos
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          ¿Tienes dudas? Contáctanos por WhatsApp
        </p>
      </div>
    </div>
  )
}
