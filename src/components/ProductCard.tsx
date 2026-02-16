import { Link } from 'react-router'
import { Heart, ShoppingCart, Star, GitCompare } from 'lucide-react'
import { useApp, Product } from '../context/AppContext'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist, addToCompare, isInCompare } = useApp()
  const inWishlist = isInWishlist(product.id)
  const inCompare = isInCompare(product.id)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
      {/* Wishlist Button */}
      <button
        onClick={() => toggleWishlist(product)}
        className={`absolute top-4 left-4 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center z-10 hover:scale-110 transition ${
          inWishlist ? 'text-red-500' : 'text-gray-400'
        }`}
      >
        <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
      </button>

      {/* Badge */}
      {product.badge && (
        <span className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold z-10">
          {product.badge}
        </span>
      )}

      {/* Image */}
      <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img 
          src={product.image || (product.category === 'sillas' 
            ? 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop'
            : product.category === 'mesas'
            ? 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop'
            : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop'
          )} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-gray-500 text-sm ml-1">({product.reviews})</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl font-bold text-teal-600">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <span className="text-gray-500 line-through text-sm">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
              <span className="text-xs text-green-600 font-medium">
                -{formatPrice(product.originalPrice - product.price)}
              </span>
            </>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">{product.description}</p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => addToCart(product)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-3 rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </button>
          <button
            onClick={() => addToCompare(product)}
            className={`px-3 py-2 rounded-lg font-medium transition flex items-center justify-center gap-1 ${
              inCompare ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={inCompare ? 'Ya en comparación' : 'Comparar'}
          >
            <GitCompare className="w-4 h-4" />
          </button>
          <Link
            to={`/product?product=${product.id}`}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
          >
            Ver
          </Link>
        </div>
      </div>
    </div>
  )
}
