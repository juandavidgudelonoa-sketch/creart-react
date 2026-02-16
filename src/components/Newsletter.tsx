import { useState } from 'react'
import { Mail, Check, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function Newsletter() {
  const { subscribe, subscribed, unsubscribe } = useApp()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.includes('@')) { setError('Email inválido'); return }
    if (!email.includes('.')) { setError('Email inválido'); return }
    subscribe(email)
    setEmail('')
    setError('')
  }

  if (subscribed) {
    return (
      <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white p-8 rounded-lg text-center">
        <Check className="w-12 h-12 mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">¡Gracias por suscribirte!</h3>
        <p className="mb-4">Recibirás nuestras ofertas y noticias en tu email.</p>
        <button onClick={unsubscribe} className="text-sm underline opacity-80 hover:opacity-100">
          Cancelar suscripción
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white p-8 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-8 h-8" />
        <h3 className="text-2xl font-bold">Suscríbete a nuestro Newsletter</h3>
      </div>
      <p className="mb-4">Recibe ofertas exclusivas, nuevos productos y noticias de CREART.</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError('') }}
          placeholder="Tu email"
          className="flex-1 px-4 py-3 rounded-lg text-gray-800"
        />
        <button type="submit" className="bg-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition">
          Suscribirse
        </button>
      </form>
      {error && <p className="text-red-200 mt-2 flex items-center gap-1"><X className="w-4 h-4" /> {error}</p>}
    </div>
  )
}
