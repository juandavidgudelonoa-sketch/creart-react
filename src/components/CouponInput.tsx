import { useState } from 'react'
import { Tag, Check, X, Percent } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function CouponInput() {
  const { applyCoupon, appliedCoupon, removeCoupon, cartSubtotal, showToast } = useApp()
  const [code, setCode] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleApply = () => {
    if (!code.trim()) return
    const result = applyCoupon(code)
    setMessage(result.message)
    setIsError(!result.valid)
    if (result.valid) showToast(result.message, 'success')
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Tag className="w-5 h-5" /> Cupón de Descuento
      </h4>
      
      {appliedCoupon ? (
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-700">{appliedCoupon.code}</p>
              <p className="text-sm text-green-600">
                {appliedCoupon.type === 'percentage' ? `-${appliedCoupon.discount}%` : `-$${appliedCoupon.discount.toLocaleString()}`}
              </p>
            </div>
          </div>
          <button onClick={() => { removeCoupon(); setMessage('') }} className="text-red-500 hover:text-red-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setMessage('') }}
              placeholder="Código del cupón"
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button onClick={handleApply} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700">
              Aplicar
            </button>
          </div>
          {message && (
            <p className={`mt-2 text-sm ${isError ? 'text-red-500' : 'text-green-500'}`}>
              {message}
            </p>
          )}
          <div className="mt-3 text-xs text-gray-500">
            <p className="font-medium">Códigos disponibles:</p>
            <p>BIENVENIDO10 - 10% de descuento</p>
            <p>CREART20 - 20% (compra mínima $500.000)</p>
            <p>DESCUENTO50 - $50.000 (compra mínima $300.000)</p>
          </div>
        </div>
      )}
    </div>
  )
}
