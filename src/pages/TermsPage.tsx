import { FileText } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function TermsPage() {
  const { storeSettings } = useApp()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FileText className="w-8 h-8 text-teal-600" />
          <h1 className="text-3xl font-bold">Términos y Condiciones</h1>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-8">
          {storeSettings.terms ? (
            <div className="prose max-w-none">
              {storeSettings.terms.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4 text-gray-700 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No hay términos y condiciones configurados.</p>
              <p className="text-sm mt-2">Contacta al administrador para más información.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
