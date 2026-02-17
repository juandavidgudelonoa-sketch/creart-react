import { memo, useCallback, useMemo } from 'react'
import { Link } from 'react-router'
import { Heart, ShoppingCart, Star, GitCompare } from 'lucide-react'
import { useApp, Product } from '../context/AppContext'

interface ProductCardProps {
  product: Product
}

// Componente memoizado para evitar re-renders innecesarios
const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const { addToCart, toggleWishlist, isInWishlist, addToCompare, isInCompare } = useApp()
  
  // Memoizar valores calculados
  const inWishlist = useMemo(() => isInWishlist(product.id), [isInWishlist, product.id])
  const inCompare = useMemo(() => isInCompare(product.id), [isInCompare, product.id])
  
  // Memoizar función de formateo de precio
  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }, [])

  // Memoizar handlers para evitar recreación en cada render
  const handleToggleWishlist = useCallback(() => {
    toggleWishlist(product)
  }, [toggleWishlist, product])

  const handleAddToCart = useCallback(() => {
    addToCart(product)
  }, [addToCart, product])

  const handleAddToCompare = useCallback(() => {
    addToCompare(product)
  }, [addToCompare, product])

  // Calcular descuento solo si hay precio original
  const discountInfo = useMemo(() => {
    if (!product.originalPrice || product.originalPrice <= product.price) return null
    return {
      percentage: Math.round((1 - product.price / product.originalPrice) * 100),
      amount: formatPrice(product.originalPrice - product.price)
    }
  }, [product.originalPrice, product.price, formatPrice])

  // Imagen por defecto según categoría
  const defaultImage = useMemo(() => {
    const categoryImages: Record<string, string> = {
      'sillas': 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
      'mesas': 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop',
      'taburetes': 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=300&fit=crop',
      'aparadores': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
      'armarios': 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop',
      'zapateras': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
      'repisas': 'https://images.unsplash.com/photo-1597072689227-8882273e8f6a?w=400&h=300&fit=crop',
      'escritorios': 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
    }
    return categoryImages[product.category] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop'
  }, [product.category])

  return (
    <article className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 relative group">
      {/* Wishlist Button */}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-4 left-4 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center z-10 hover:scale-110 transition-transform duration-200 ${
          inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
        }`}
        aria-label={inWishlist ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''} transition-all duration-200`} />
      </button>

      {/* Badge */}
      {product.badge && (
        <span className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1 rounded-full text-xs font-bold z-10 shadow-md">
          {product.badge}
        </span>
      )}

      {/* Image */}
      <div className="h-52 bg-gray-100 flex items-center justify-center overflow-hidden">
        <img 
          src={product.image || defaultImage} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-1">{product.name}</h3>
        
        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-gray-500 text-sm ml-2">({product.reviews} reseñas)</span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-2xl font-bold text-teal-600">
            {formatPrice(product.price)}
          </span>
          {discountInfo && (
            <>
              <span className="text-gray-400 line-through text-sm">
                {formatPrice(product.originalPrice!)}
              </span>
              <span className="bg-gradient-to-r from-green-500 to-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                -{discountInfo.percentage}%
              </span>
            </>
          )}
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2.5 px-4 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            Agregar
          </button>
          <button
            onClick={handleAddToCompare}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow-md active:scale-95 ${
              inCompare 
                ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={inCompare ? 'Ya en comparación' : 'Comparar'}
            aria-label={inCompare ? 'Quitar de comparación' : 'Agregar a comparación'}
          >
            <GitCompare className="w-4 h-4" />
          </button>
          <Link
            to={`/product?product=${product.id}`}
            className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center shadow-sm hover:shadow-md active:scale-95"
          >
            Ver
          </Link>
        </div>
      </div>
    </article>
  )
})

export default ProductCard
