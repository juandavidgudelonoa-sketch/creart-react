import { Link, useSearchParams } from 'react-router'
import { Clock, CheckCircle, Mail, HelpCircle, MessageCircle, RefreshCw } from 'lucide-react'

export default function PendingPage() {
  const [searchParams] = useSearchParams()
  
  const paymentId = searchParams.get('payment_id')
  const preferenceId = searchParams.get('preference_id')
  const externalReference = searchParams.get('external_reference')

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Card principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header amarillo/naranja */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 text-center">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Clock className="w-14 h-14 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Pago en Proceso</h1>
            <p className="text-yellow-100 text-lg">Tu pago está siendo verificado</p>
          </div>

          {/* Contenido */}
          <div className="p-8">
            {/* Mensaje principal */}
            <div className="text-center mb-8">
              <p className="text-gray-600 text-lg">
                Tu pago está siendo <strong>verificado</strong> por MercadoPago. 
                Esto puede tomar algunos minutos.
              </p>
            </div>

            {/* Explicación del proceso */}
            <div className="bg-yellow-50 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-yellow-800 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                ¿Qué está pasando?
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex flex-shrink- items-center justify-center0 text-yellow-700 font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Pago iniciado</h4>
                    <p className="text-sm text-gray-600">
                      Has iniciado el proceso de pago con MercadoPago.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center flex-shrink-0 text-yellow-700 font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Verificación en curso</h4>
                    <p className="text-sm text-gray-600">
                      MercadoPago está verificando los datos de tu tarjeta y banco.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 text-gray-500 font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">Confirmación</h4>
                    <p className="text-sm text-gray-600">
                      Recibirás una confirmación cuando el pago sea aprobado.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del pago */}
            {paymentId && (
              <div className="bg-gray-50 rounded-2xl p-6 mb-6">
                <h3 className="font-bold text-gray-800 mb-3">Detalles del pago</h3>
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-bold text-yellow-600">Pendiente</span>
                  </div>
                </div>
              </div>
            )}

            {/* Información importante */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-6">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Te notificaremos
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>Recibirás un correo electrónico cuando se confirme el pago</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>También puedes verificar el estado en "Mis Pedidos"</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <span>El pedido se procesará una vez confirmado el pago</span>
                </li>
              </ul>
            </div>

            {/* Tiempo estimado */}
            <div className="bg-green-50 rounded-2xl p-6 mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-6 h-6 text-green-600" />
                <span className="text-green-800 font-bold">Tiempo estimado de verificación</span>
              </div>
              <p className="text-3xl font-bold text-green-700">5-30 minutos</p>
              <p className="text-sm text-gray-600 mt-2">
                La mayoría de los pagos se verifican en pocos minutos
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/orders"
                className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-6 rounded-2xl font-bold text-center hover:from-teal-700 hover:to-teal-800 transition flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Ver mis pedidos
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

        {/* Ayuda adicional */}
        <div className="mt-8 bg-white rounded-3xl shadow-xl p-6">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            Preguntas frecuentes
          </h3>
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-bold text-gray-800 mb-1">¿Qué pasa si el pago no se aprueba?</h4>
              <p className="text-sm text-gray-600">
                Si el pago no se aprueba después de 30 minutos, recibirás una notificación y serás redirigido automáticamente.
              </p>
            </div>
            <div className="border-b border-gray-100 pb-4">
              <h4 className="font-bold text-gray-800 mb-1">¿Puedo cancelar el pedido?</h4>
              <p className="text-sm text-gray-600">
                Sí, contactános por WhatsApp si deseas cancelar tu pedido antes de que sea procesado.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-1">¿El dinero fue debitado?</h4>
              <p className="text-sm text-gray-600">
                El dinero puede estar pendiente hasta que se complete la verificación. No se te cobrará hasta que el pago sea aprobado.
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          ¿Tienes dudas? Contáctanos por WhatsApp
        </p>
      </div>
    </div>
  )
}
