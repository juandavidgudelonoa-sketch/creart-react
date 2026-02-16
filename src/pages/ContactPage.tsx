import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function ContactPage() {
  const { showToast, products } = useApp()
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    producto: '',
    motivo: '',
    mensaje: ''
  })
  const [enviando, setEnviando] = useState(false)

  const motivos = [
    'Consulta sobre producto',
    'Pedido personalizado',
    'Garantía',
    'Sugerencia',
    'Otro'
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setEnviando(true)
    
    const message = `🪑 *CONSULTA CREART* 🪑

*Nombre:* ${formData.nombre}
*Email:* ${formData.email || 'No proporcionado'}
*Teléfono:* ${formData.telefono}
*Producto:* ${formData.producto || 'General'}
*Motivo:* ${formData.motivo}

*Mensaje:*
${formData.mensaje}`
    
    setTimeout(() => {
      window.open(`https://wa.me/573159934696?text=${encodeURIComponent(message)}`, '_blank')
      showToast('Mensaje enviado por WhatsApp', 'success')
      setEnviando(false)
      setFormData({ nombre: '', email: '', telefono: '', producto: '', motivo: '', mensaje: '' })
    }, 1000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-4">Contáctanos</h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        ¿Tienes preguntas sobre nuestros muebles? Estamos aquí para ayudarte. 
        Escríbenos y te responderemos pronto.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-teal-600 to-teal-800 rounded-2xl p-6 text-white shadow-xl">
            <h2 className="text-2xl font-bold mb-6">CREART</h2>
            <p className="mb-6 opacity-90">Muebles personalizados en Cali, Colombia</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <span>Cali, Valle del Cauca</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-phone"></i>
                </div>
                <span>+57 315 9934696</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fab fa-whatsapp"></i>
                </div>
                <span>WhatsApp disponible</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <i className="fas fa-clock"></i>
                </div>
                <span>Lun-Sáb: 8am-6pm</span>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <h3 className="font-semibold mb-3">Síguenos</h3>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Envíanos un mensaje</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre completo *</label>
                <input 
                  type="text" 
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                  placeholder="Tu nombre"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono *</label>
                <input 
                  type="tel" 
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                  placeholder="+57 300 123 4567"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Producto de interés</label>
                <select 
                  name="producto"
                  value={formData.producto}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
                >
                  <option value="">Seleccionar producto</option>
                  {products.slice(0, 10).map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Motivo de contacto *</label>
              <select 
                name="motivo"
                value={formData.motivo}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition"
              >
                <option value="">Seleccionar motivo</option>
                {motivos.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje *</label>
              <textarea 
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition resize-none"
                placeholder="Cuéntanos en qué podemos ayudarte..."
              ></textarea>
            </div>

            <button 
              type="submit"
              disabled={enviando}
              className="w-full bg-gradient-to-r from-teal-600 to-teal-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-teal-700 hover:to-teal-800 transition transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {enviando ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="fab fa-whatsapp text-xl"></i>
                  Enviar mensaje por WhatsApp
                </>
              )}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              Al enviar, serás redirigido a WhatsApp para completar el mensaje
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
