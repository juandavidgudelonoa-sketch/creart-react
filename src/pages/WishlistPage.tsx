import { Link } from 'react-router'
import { Heart, Trash2, ShoppingCart, Package } from 'lucide-react'
import { useApp, Product } from '../context/AppContext'

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useApp()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Función para obtener imagen por defecto según categoría
  const getDefaultImage = (product: Product) => {
    const categoryImages: Record<string, string> = {
      'sillas': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
      'mesas': 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop',
      'taburetes': 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=300&fit=crop',
      'aparadores': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
      'armarios': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop',
      'zapateras': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
      'repisas': 'https://images.unsplash.com/photo-1597072689227-8882273e8f6a?w=400&h=300&fit=crop',
      'escritorios': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
      'centro-entretenimiento': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      'mueble-bano': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop',
    }
    return categoryImages[product.category] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop'
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-red-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 md:w-12 md:h-12 text-red-500" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-gray-800">Tu lista está vacía</h2>
            <p className="text-gray-500 mb-6 md:mb-8 text-base md:text-lg">Guarda tus productos favoritos aquí.</p>
            <Link to="/catalog" className="inline-block bg-gradient-to-r from-teal-600 to-teal-700 text-white py-3 md:py-4 px-8 md:px-10 rounded-full font-bold text-base md:text-lg hover:from-teal-700 hover:to-teal-800 transition transform hover:scale-105 shadow-lg">
              🛍️ Explorar Catálogo
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 md:py-8">
      <div className="container mx-auto px-2 md:px-4">
        
        {/* Header */}
        <div className="mb-4 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-800">❤️ Mis Favoritos</h1>
          <p className="text-gray-600 text-sm md:text-base">{wishlist.length} productos guardados</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {wishlist.map(product => (
            <div key={product.id} className="bg-white rounded-2xl md:rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition">
              {/* Imagen del producto */}
              <div className="h-36 md:h-48 bg-gray-100 relative">
                <img 
                  src={product.image || getDefaultImage(product)} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <button 
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-red-50 transition shadow-md"
                >
                  <Heart className="w-4 h-4 md:w-5 md:h-5 text-red-500 fill-current" />
                </button>
                {product.badge && (
                  <span className="absolute top-2 left-2 bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    {product.badge}
                  </span>
                )}
              </div>
              
              <div className="p-3 md:p-4">
                <h3 className="font-bold text-sm md:text-lg mb-1 text-gray-800 line-clamp-1">{product.name}</h3>
                <p className="text-teal-600 font-bold text-base md:text-xl mb-2 md:mb-3">{formatPrice(product.price)}</p>
                
                <div className="flex gap-1.5 md:gap-2">
                  <button 
                    onClick={() => addToCart(product)}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 md:py-2.5 rounded-lg md:rounded-xl font-semibold text-xs md:text-sm hover:from-orange-600 hover:to-red-600 transition flex items-center justify-center gap-1 md:gap-2"
                  >
                    <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">Agregar</span>
                  </button>
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className="px-2 md:px-3 py-2 md:py-2.5 bg-gray-100 text-gray-600 rounded-lg md:rounded-xl hover:bg-gray-200 transition"
                  >
                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
