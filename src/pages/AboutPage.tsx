import { Store, MapPin, Phone } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function AboutPage() {
  const { storeSettings } = useApp()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{storeSettings.storeName}</h1>
          <p className="text-xl text-gray-600">{storeSettings.slogan}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Store className="w-6 h-6 text-teal-600" />
            Sobre Nosotros
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {storeSettings.description || 'Somos una empresa dedicada a la fabricación de muebles personalizados de alta calidad. Ubicados en Cali, Colombia, nos especializamos en crear piezas únicas que combinan elegancia y funcionalidad para tu hogar o negocio.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Ubicación
            </h3>
            <p className="text-gray-700">{storeSettings.city || 'Cali, Colombia'}</p>
            {storeSettings.address && (
              <p className="text-gray-600 mt-1">{storeSettings.address}</p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-teal-600" />
              Contacto
            </h3>
            {storeSettings.phone && (
              <p className="text-gray-700">📞 {storeSettings.phone}</p>
            )}
            {storeSettings.whatsapp && (
              <p className="text-gray-700">💬 {storeSettings.whatsapp}</p>
            )}
            {storeSettings.email && (
              <p className="text-gray-700">✉️ {storeSettings.email}</p>
            )}
          </div>
        </div>

        {/* Redes Sociales */}
        {(storeSettings.facebook || storeSettings.instagram || storeSettings.youtube || storeSettings.tiktok) && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Síguenos en Redes Sociales</h3>
            <div className="flex gap-4">
              {storeSettings.facebook && (
                <a 
                  href={storeSettings.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Facebook
                </a>
              )}
              {storeSettings.instagram && (
                <a 
                  href={storeSettings.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-800 font-medium"
                >
                  Instagram
                </a>
              )}
              {storeSettings.youtube && (
                <a 
                  href={storeSettings.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  YouTube
                </a>
              )}
              {storeSettings.tiktok && (
                <a 
                  href={storeSettings.tiktok} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-800 hover:text-black font-medium"
                >
                  TikTok
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
