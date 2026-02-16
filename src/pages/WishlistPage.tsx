import { Link } from 'react-router'
import { Heart, Trash2, ShoppingCart } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useApp()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (wishlist.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Tu lista de deseos está vacía</h2>
        <p className="text-gray-500 mb-8">Guarda tus productos favoritos aquí.</p>
        <Link to="/catalog" className="inline-block bg-teal-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-teal-700 transition">
          Explorar Catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mi Lista de Deseos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlist.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <span className="text-6xl">🪑</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              <p className="text-teal-600 font-bold text-xl mb-3">{formatPrice(product.price)}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => addToCart(product)}
                  className="flex-1 bg-teal-600 text-white py-2 rounded-lg font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Agregar
                </button>
                <button 
                  onClick={() => toggleWishlist(product)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
