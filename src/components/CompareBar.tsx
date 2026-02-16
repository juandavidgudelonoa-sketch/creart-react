import { useState } from 'react'
import { Link } from 'react-router'
import { GitCompare, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function CompareBar() {
  const { compareList, removeFromCompare, clearCompare } = useApp()
  const [isVisible, setIsVisible] = useState(true)

  if (compareList.length === 0) return null

  const formatPrice = (price: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

  return (
    <>
      {/* Botón flotante para mostrar cuando está oculto */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="fixed bottom-4 right-4 bg-teal-600 text-white p-4 rounded-full shadow-xl z-50 hover:bg-teal-700 transition flex items-center gap-2"
        >
          <GitCompare className="w-5 h-5" />
          <span className="font-medium">Comparar ({compareList.length})</span>
        </button>
      )}

      {/* Barra de comparación */}
      {isVisible && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-xl border-t z-40">
          {/* Barra desplazable horizontal */}
          <div className="overflow-x-auto scrollbar-thin">
            <div className="flex items-center gap-3 px-4 py-3 min-w-max">
              
              {/* Header de la barra */}
              <div className="flex-shrink-0 flex items-center gap-3 pr-3 border-r">
                <div>
                  <h4 className="font-semibold text-sm flex items-center gap-1">
                    <GitCompare className="w-4 h-4" /> 
                    Comparar ({compareList.length}/4)
                  </h4>
                  <button 
                    onClick={clearCompare} 
                    className="text-xs text-red-500 hover:underline"
                  >
                    Limpiar
                  </button>
                </div>
                <button 
                  onClick={() => setIsVisible(false)}
                  className="p-2 hover:bg-gray-200 rounded-full bg-gray-100"
                  title="Cerrar barra"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Productos en la barra */}
              {compareList.map(product => (
                <div 
                  key={product.id} 
                  className="flex-shrink-0 bg-gray-100 rounded-lg p-2 w-36 relative"
                >
                  {/* X para eliminar cada producto */}
                  <button 
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition shadow-md"
                    title="Eliminar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  
                  {/* Imagen del producto */}
                  <div className="w-full h-12 bg-gray-200 rounded mb-1 overflow-hidden flex items-center justify-center">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">
                        {product.category === 'sillas' ? '🪑' : product.category === 'mesas' ? '🪵' : '🪑'}
                      </span>
                    )}
                  </div>
                  
                  <p className="font-medium text-xs truncate">{product.name}</p>
                  <p className="text-teal-600 font-bold text-xs">{formatPrice(product.price)}</p>
                </div>
              ))}

              {/* Botón comparar */}
              <Link 
                to="/compare" 
                className="flex-shrink-0 bg-teal-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-700"
              >
                Comparar
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
