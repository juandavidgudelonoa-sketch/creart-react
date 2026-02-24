import { Link, useSearchParams } from 'react-router'
import { XCircle, RefreshCw, HelpCircle, MessageCircle, ArrowLeft, ShoppingBag } from 'lucide-react'

export default function FailurePage() {
  const [searchParams] = useSearchParams()
  
  const paymentId = searchParams.get('payment_id')
  const preferenceId = searchParams.get('preference_id')
  const status = searchParams.get('status')

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header rojo */}
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <XCircle className="w-14 h-14 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Pago No Completado</h1>
            <p className="text-red-100 text-lg">Hubo un problema con tu pago</p>
          </div>

          {/* Contenido */}
          <div className="p-8">
            {/* Mensaje de error */}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg">
                Tu pago no fue procesado. Esto puede haber ocurrido por:
              </p>
            </div>

            {/* Razones comunes */}
            <div className="bg-red-50 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-red-800 mb-3 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Posibles razones
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Tu tarjeta fue rechazada por el banco</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Los datos de la tarjeta no son correctos</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>Tu tarjeta no tiene fondos suficientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span>La conexión se perdió durante el pago</span>
                </li>
              </ul>
            </div>

            {/* Información del intento */}
            {paymentId && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-gray-800 mb-3">Información del intento</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID de Pago:</span>
                    <span className="font-mono text-gray-800">{paymentId}</span>
                  </div>
                  {status && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className="font-medium text-red-600">{status}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recomendaciones */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-blue-800 mb-3">¿Qué puedes hacer?</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Intentar nuevamente con la misma tarjeta</span>
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Usar otra tarjeta o método de pago</span>
                </li>
                <li className="flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Contactar a tu banco para más información</span>
                </li>
              </ul>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/cart"
                className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-6 rounded-2xl font-bold text-center hover:from-teal-700 hover:to-teal-800 transition flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-5 h-5" />
                Volver al carrito
              </Link>
              <a 
                href="https://wa.me/573159934696"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-green-500 text-white py-4 px-6 rounded-2xl font-bold text-center hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Contactar soporte
              </a>
            </div>
          </div>
        </div>

        {/* Alternativas de pago */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl p-6">
          <h3 className="font-bold text-gray-800 mb-4 text-center">
            Otros métodos de pago disponibles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link 
              to="/cart"
              className="p-4 bg-gray-50 rounded-2xl text-center hover:bg-gray-100 transition"
            >
              <div className="text-3xl mb-2">💵</div>
              <div className="font-bold text-gray-800">Contra entrega</div>
              <div className="text-xs text-gray-500">Paga al recibir</div>
            </Link>
            <Link 
              to="/cart"
              className="p-4 bg-gray-50 rounded-2xl text-center hover:bg-gray-100 transition"
            >
              <div className="text-3xl mb-2">🏦</div>
              <div className="font-bold text-gray-800">Transferencia</div>
              <div className="text-xs text-gray-500">Bancolombia</div>
            </Link>
            <Link 
              to="/cart"
              className="p-4 bg-gray-50 rounded-2xl text-center hover:bg-gray-100 transition"
            >
              <div className="text-3xl mb-2">📱</div>
              <div className="font-bold text-gray-800">WhatsApp</div>
              <div className="text-xs text-gray-500">Pedido por chat</div>
            </Link>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          ¿Necesitas ayuda? Estamos aquí para ayudarte
        </p>
      </div>
    </div>
  )
}
