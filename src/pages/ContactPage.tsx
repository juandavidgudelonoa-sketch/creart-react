import { useApp } from '../context/AppContext'

export default function ContactPage() {
  const { showToast } = useApp()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const message = `Hola! Quiero información sobre:\n\nProducto: ${formData.get('producto')}\nNombre: ${formData.get('nombre')}\nTeléfono: ${formData.get('telefono')}\nMensaje: ${formData.get('mensaje')}`
    
    window.open(`https://wa.me/573159934696?text=${encodeURIComponent(message)}`, '_blank')
    showToast('Mensaje enviado por WhatsApp', 'success')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-12">Contáctanos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-bold mb-6">CREART - Muebles Personalizados</h2>
          
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-map-marker-alt text-white"></i>
              </div>
              <div>
                <h3 className="font-semibold">Dirección</h3>
                <p className="text-gray-600">Cali, Valle del Cauca, Colombia</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-phone text-white"></i>
              </div>
              <div>
                <h3 className="font-semibold">Teléfono</h3>
                <p className="text-gray-600">+57 315 993 4696</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fab fa-whatsapp text-white"></i>
              </div>
              <div>
                <h3 className="font-semibold">WhatsApp</h3>
                <p className="text-gray-600">+57 315 993 4696</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-envelope text-white"></i>
              </div>
              <div>
                <h3 className="font-semibold">Email</h3>
                <p className="text-gray-600">muebleriacreat@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-clock text-white"></i>
              </div>
              <div>
                <h3 className="font-semibold">Horario</h3>
                <p className="text-gray-600">Lunes a Sábado: 8am - 6pm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Solicita tu Cotización</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
              <input
                type="text"
                name="nombre"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Tu número"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Producto de interés</label>
              <select
                name="producto"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Selecciona</option>
                <option value="silla">Silla</option>
                <option value="mesa">Mesa</option>
                <option value="taburete">Taburete</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
              <textarea
                name="mensaje"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Cuéntanos sobre el mueble que necesitas"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
            >
              <i className="fab fa-whatsapp"></i>
              Enviar por WhatsApp
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
