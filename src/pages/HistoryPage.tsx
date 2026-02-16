import { Link } from 'react-router'
import { History, Trash2, ShoppingCart } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function HistoryPage() {
  const { viewedProducts, clearHistory, addToCart } = useApp()

  const formatPrice = (price: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

  if (viewedProducts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <History className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">No hay historial</h2>
        <p className="text-gray-500 mb-8">Los productos que veas aparecerán aquí</p>
        <Link to="/catalog" className="bg-teal-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-teal-700">
          Explorar Catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <History className="w-8 h-8" /> Historial de Navegación
        </h1>
        <button onClick={clearHistory} className="text-red-500 hover:underline flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Limpiar historial
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {viewedProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition">
            <div className="h-40 bg-gray-100 flex items-center justify-center text-5xl">
              {product.category === 'sillas' ? '🪑' : product.category === 'mesas' ? '🪵' : '🪑'}
            </div>
            <div className="p-4">
              <h3 className="font-semibold">{product.name}</h3>
              <p className="text-teal-600 font-bold text-lg">{formatPrice(product.price)}</p>
              <div className="flex gap-2 mt-3">
                <button onClick={() => addToCart(product)} className="flex-1 bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 flex items-center justify-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Agregar
                </button>
                <Link to={`/catalog?product=${product.id}`} className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  Ver
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
