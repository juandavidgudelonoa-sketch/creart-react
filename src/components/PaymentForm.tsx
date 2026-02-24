import { useEffect, useState } from 'react'
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react'

interface PaymentFormProps {
  total: number
  customerName: string
  customerEmail: string
  onSuccess: (paymentId: string) => void
  onError: (error: string) => void
  onClose: () => void
}

declare global {
  interface Window {
    MercadoPago: any
  }
}

export default function PaymentForm({ total, customerName, customerEmail, onSuccess, onError, onClose }: PaymentFormProps) {
  const [cardFormReady, setCardFormReady] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [step, setStep] = useState<'form' | 'processing' | 'success' | 'error'>('form')
  const [errorMessage, setErrorMessage] = useState('')
  const [cardToken, setCardToken] = useState('')
  const [paymentMethodId, setPaymentMethodId] = useState('')

  const PUBLIC_KEY = 'TEST-c17fda90-bf0c-42da-876c-d27444f51979'

  useEffect(() => {
    // Initialize MercadoPago
    const mp = new window.MercadoPago(PUBLIC_KEY, {
      locale: 'es-CO'
    })

    // Create card form
    const cardForm = mp.cardForm({
      amount: String(total),
      autoMount: true,
      processingMode: 'aggregator',
      mode: 'card',
      callbacks: {
        onFormMounted: (error: any) => {
          if (error) {
            console.error('Form mounted error:', error)
            setErrorMessage('Error al cargar el formulario de pago')
          } else {
            console.log('Form mounted successfully')
            setCardFormReady(true)
          }
        },
        onCardTokenGenerated: (error: any, token: any) => {
          if (error) {
            console.error('Token error:', error)
            setErrorMessage('Error al procesar la tarjeta')
            setStep('error')
          } else {
            console.log('Token generated:', token)
            setCardToken(token.token_id)
            setPaymentMethodId(token.payment_method_id)
          }
        },
        onSubmit: (event: any) => {
          event.preventDefault()
          setStep('processing')
          setIsProcessing(true)
          
          // The actual submission will be handled by the parent component
          const formData = cardForm.getCardFormData()
          console.log('Card form data:', formData)
        }
      }
    })

    return () => {
      // Cleanup if needed
    }
  }, [total])

  const handleSubmit = async () => {
    if (!cardToken) {
      // Trigger token generation first
      const mp = new window.MercadoPago(PUBLIC_KEY)
      const cardForm = mp.cardForm({
        amount: String(total),
        autoMount: false,
        processingMode: 'aggregator',
        mode: 'card'
      })
      
      // Generate token
      await cardForm.createCardToken()
      return
    }

    // If we have the token, the parent will handle the payment
    setStep('processing')
  }

  // Expose the submit function to parent
  useEffect(() => {
    (window as any).submitMercadoPagoPayment = async () => {
      if (!cardToken) {
        setErrorMessage('Por favor completa los datos de la tarjeta')
        setStep('error')
        return
      }
      setStep('processing')
    }
    
    return () => {
      delete (window as any).submitMercadoPagoPayment
    }
  }, [cardToken, paymentMethodId, total, customerEmail])

  if (step === 'success') {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-600 mb-2">¡Pago exitoso!</h3>
        <p className="text-gray-600">Tu pago ha sido procesado correctamente.</p>
        <button
          onClick={onClose}
          className="mt-6 bg-green-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-600 transition"
        >
          Cerrar
        </button>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center py-8">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-red-600 mb-2">Error en el pago</h3>
        <p className="text-gray-600 mb-4">{errorMessage}</p>
        <button
          onClick={() => {
            setStep('form')
            setErrorMessage('')
            setCardToken('')
          }}
          className="bg-blue-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition"
        >
          Intentar de nuevo
        </button>
      </div>
    )
  }

  if (step === 'processing') {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Procesando pago...</h3>
        <p className="text-gray-600">Por favor espera mientras procesamos tu pago</p>
      </div>
    )
  }

  return (
    <div className="payment-form-container">
      <div className="bg-gray-50 p-4 rounded-xl mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total a pagar:</span>
          <span className="text-2xl font-bold text-gray-800">
            ${total.toLocaleString('es-CO')}
          </span>
        </div>
      </div>

      {/* MercadoPago Card Form will be mounted here */}
      <form id="card-form" className="space-y-4">
        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Número de tarjeta
          </label>
          <div id="cardNumber" className="border-2 border-gray-200 rounded-xl px-4 py-3 bg-white"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de vencimiento
            </label>
            <div id="cardExpirationDate" className="border-2 border-gray-200 rounded-xl px-4 py-3 bg-white"></div>
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CVV
            </label>
            <div id="cardCVV" className="border-2 border-gray-200 rounded-xl px-4 py-3 bg-white"></div>
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del titular
          </label>
          <div id="cardholderName" className="border-2 border-gray-200 rounded-xl px-4 py-3 bg-white">
            <input 
              type="text" 
              className="w-full outline-none"
              placeholder={customerName || 'Nombre como aparece en la tarjeta'}
              defaultValue={customerName}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <div className="border-2 border-gray-200 rounded-xl px-4 py-3 bg-white">
            <input 
              type="email" 
              className="w-full outline-none"
              placeholder="tu@email.com"
              defaultValue={customerEmail}
              id="cardholderEmail"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Documento de identidad
          </label>
          <div id="docType" className="border-2 border-gray-200 rounded-xl px-4 py-3 bg-white"></div>
        </div>

        <div className="form-group">
          <div id="docNumber" className="border-2 border-gray-200 rounded-xl px-4 py-3 bg-white">
            <input 
              type="text" 
              className="w-full outline-none"
              placeholder="Número de documento"
              id="docNumberInput"
            />
          </div>
        </div>
      </form>

      <div className="mt-6 flex gap-4">
        <button
          onClick={onClose}
          className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={!cardFormReady || isProcessing}
          className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition disabled:opacity-50"
        >
          {isProcessing ? 'Procesando...' : `Pagar $${total.toLocaleString('es-CO')}`}
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-4 text-center">
        <CreditCard className="w-4 h-4 inline mr-1" />
        Tus datos están seguros con MercadoPago
      </p>
    </div>
  )
}
