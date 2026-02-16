import { useEffect } from 'react'
import { useSearchParams, Link } from 'react-router'
import { ArrowLeft, Heart, ShoppingCart, Star, GitCompare, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ReviewsSection from '../components/ReviewsSection'
import ProductCard from '../components/ProductCard'

export default function ProductDetailPage() {
  const [searchParams] = useSearchParams()
  const productId = searchParams.get('product')
  const { getProductById, addToCart, toggleWishlist, isInWishlist, addToHistory, addToCompare, isInCompare } = useApp()
  
  const product = getProductById(productId || '')
  const relatedProducts = product ? useApp().getRelatedProducts(product.id) : []

  useEffect(() => {
    if (product) {
      addToHistory(product)
    }
  }, [product])

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
        <Link to="/catalog" className="bg-teal-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-teal-700">
          Volver al Catálogo
        </Link>
      </div>
    )
  }

  const inWishlist = isInWishlist(product.id)
  const inCompare = isInCompare(product.id)

  const formatPrice = (price: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Link to="/catalog" className="flex items-center gap-2 text-gray-500 hover:text-teal-600 mb-6">
        <ArrowLeft className="w-4 h-4" /> Volver al catálogo
      </Link>

      {/* Product Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Image */}
        <div className="bg-gray-100 rounded-xl overflow-hidden">
          <img 
            src={product.image || (product.category === 'sillas' 
              ? 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=600&fit=crop'
              : product.category === 'mesas'
              ? 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800&h=600&fit=crop'
              : 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop'
            )} 
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-5 h-5 ${i <= product.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-gray-500">({product.reviews} reseñas)</span>
              </div>
            </div>
            {product.badge && (
              <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {product.badge}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-3xl font-bold text-teal-600">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Ahorras {formatPrice(product.originalPrice - product.price)} ({Math.round((1 - product.price / product.originalPrice) * 100)}%)
                </span>
              </>
            )}
          </div>

          <p className="text-gray-600 mb-6 whitespace-pre-line">{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-gray-600">Disponibilidad:</span>
            <span className={`font-semibold ${product.stock && product.stock > 5 ? 'text-green-600' : 'text-orange-500'}`}>
              {product.stock} unidades en stock
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mb-6">
            <button 
              onClick={() => addToCart(product)}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 rounded-lg font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Agregar al Carrito
            </button>
            <button 
              onClick={() => toggleWishlist(product)}
              className={`p-3 rounded-lg border-2 transition ${inWishlist ? 'bg-red-50 border-red-500 text-red-500' : 'border-gray-300 hover:border-red-500'}`}
            >
              <Heart className={`w-6 h-6 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
            <button 
              onClick={() => addToCompare(product)}
              className={`p-3 rounded-lg border-2 transition ${inCompare ? 'bg-teal-50 border-teal-500 text-teal-600' : 'border-gray-300 hover:border-teal-500'}`}
            >
              <GitCompare className="w-6 h-6" />
            </button>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Características:</h3>
              <ul className="space-y-2">
                {product.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600">
                    <Check className="w-4 h-4 text-green-500" /> {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <ReviewsSection product={product} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Productos Relacionados</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
