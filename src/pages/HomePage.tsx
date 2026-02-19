import { Link } from 'react-router'
import ProductCard from '../components/ProductCard'
import { useApp } from '../context/AppContext'

// Categorías por defecto (se sobrescriben con las guardadas)
const defaultCategories = [
  { id: 'sillas', name: 'Sillas', icon: 'fa-chair', color: 'text-teal-600', image: '' },
  { id: 'mesas', name: 'Mesas', icon: 'fa-table', color: 'text-orange-500', image: '' },
  { id: 'taburetes', name: 'Taburetes', icon: 'fa-square', color: 'text-green-600', image: '' },
  { id: 'aparadores', name: 'Aparadores', icon: 'fa-dungeon', color: 'text-blue-600', image: '' },
  { id: 'armarios', name: 'Armarios', icon: 'fa-door-closed', color: 'text-purple-600', image: '' },
  { id: 'zapateras', name: 'Zapateras', icon: 'fa-shoe-prints', color: 'text-amber-600', image: '' },
  { id: 'repisas', name: 'Repisas', icon: 'fa-grip-lines', color: 'text-gray-600', image: '' },
  { id: 'escritorios', name: 'Escritorios', icon: 'fa-laptop', color: 'text-indigo-600', image: '' },
  { id: 'centro-entretenimiento', name: 'Centro Entretenimiento', icon: 'fa-tv', color: 'text-cyan-600', image: '' },
  { id: 'mueble-bano', name: 'Mueble Baño', icon: 'fa-bath', color: 'text-sky-600', image: '' },
]

export default function HomePage() {
  const { products, reviews, storeSettings } = useApp()

  // Cargar categorías desde localStorage o usar las por defecto
  const categories = (() => {
    const saved = localStorage.getItem('creart_categories')
    return saved ? JSON.parse(saved) : defaultCategories
  })()

  // Obtener las últimas reseñas de productos
  const recentReviews = [...reviews]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6)

  // Obtener productos con reseñas para mostrar el nombre
  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId)
    return product?.name || 'Producto'
  }

  const featuredProducts = products.filter(p => p.featured).slice(0, 4)
  const displayProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4)

  // Testimonios estáticos por defecto si no hay reseñas
  const staticTestimonials = [
    { name: 'María Cortés', text: 'La calidad es excepcional y el diseño es perfecto.', since: 'Cliente desde 2022' },
    { name: 'Juan López', text: 'El proceso fue sencillo y el servicio, excepcional.', since: 'Cliente desde 2023' },
    { name: 'Rosa Pérez', text: 'La durabilidad es exactamente lo que necesitaba.', since: 'Propietaria de Restaurante' },
  ]

  // Usar reseñas reales si existen, si no usar testimonios por defecto
  const displayTestimonials = recentReviews.length > 0 ? recentReviews.map(r => ({
    name: r.userName,
    text: r.comment,
    since: new Date(r.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' }),
    rating: r.rating,
    productName: getProductName(r.productId)
  })) : staticTestimonials

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="h-[60vh] md:h-[80vh] bg-cover bg-center flex items-center justify-center text-white relative"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1920&q=80)'
        }}
      >
        <div className="container mx-auto px-4 text-center animate-fadeInUp">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">Muebles Personalizados en Cali</h2>
          <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8">Diseño único y craftsmanship de calidad para tu hogar o negocio.</p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link to="/catalog" className="inline-block bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-6 md:px-8 rounded-full font-semibold hover:opacity-90 transition text-sm md:text-base btn-primary btn-shine">
              Explorar Colección
            </Link>
            <a href="https://wa.me/573159934696" target="_blank" className="inline-block bg-green-500 text-white py-3 px-6 md:px-8 rounded-full font-semibold hover:bg-green-600 transition text-sm md:text-base btn-bounce">
              <i className="fab fa-whatsapp mr-2"></i> Chatea con Nosotros
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 md:py-16 container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-12 relative animate-fadeInUp">
          Nuestras Categorías
          <span className="block w-16 h-1 bg-gradient-to-r from-orange-500 to-teal-500 mx-auto mt-4"></span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-6">
          {categories.filter((cat: any) => storeSettings.categoriesVisibility?.[cat.id] !== false).map((cat: any, index: number) => (
            <Link to={`/catalog/${cat.id}`} key={cat.id} className={`bg-white rounded-lg shadow-md p-4 md:p-6 text-center hover:shadow-xl transition card-elevate animate-enter animate-enter-delay-${(index % 4) + 1}`}>
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-16 md:h-24 object-contain mb-2 md:mb-3" />
              ) : (
                <i className={`fas ${cat.icon} ${cat.color} text-3xl md:text-5xl mb-2 md:mb-3`}></i>
              )}
              <h3 className="text-sm md:text-lg font-semibold">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 relative animate-fadeInUp">
            Productos Destacados
            <span className="block w-16 h-1 bg-gradient-to-r from-orange-500 to-teal-500 mx-auto mt-4"></span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayProducts.map((product, index) => (
              <div key={product.id} className={`animate-enter animate-enter-delay-${index + 1}`}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/catalog" className="inline-block bg-teal-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-teal-700 transition btn-bounce">
              Ver Todo el Catálogo
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-8 md:py-16 bg-gradient-to-b from-teal-600 to-green-600 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-12 animate-fadeInUp">Opiniones de Clientes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {displayTestimonials.map((t: any, i: number) => (
              <div key={i} className={`bg-white/10 backdrop-blur-sm rounded-lg p-4 md:p-6 card-elevate animate-enter animate-enter-delay-${i + 1}`}>
                {/* Estrellas */}
                {t.rating && (
                  <div className="flex gap-1 mb-3">
                    {[1, 2, 3, 4, 5].map((star: number) => (
                      <span key={star} className={`text-lg ${star <= t.rating ? 'text-yellow-400' : 'text-gray-400'}`}>★</span>
                    ))}
                  </div>
                )}
                <p className="italic mb-4 text-sm md:text-base">"{t.text}"</p>
                {'productName' in t && t.productName && (
                  <p className="text-sm text-teal-200 mb-2">📦 {t.productName}</p>
                )}
                <div className="flex items-center">
                  <div className="w-10 md:w-12 h-10 md:h-12 rounded-full bg-white text-teal-600 flex items-center justify-center font-bold mr-3 text-sm">
                    {t.name.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm md:text-base">{t.name}</h4>
                    <p className="text-xs md:text-sm opacity-75">{t.since}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 md:py-20 bg-teal-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">¿Listo para transformar tu espacio?</h2>
          <p className="text-lg md:text-xl mb-6 md:mb-8">Diseña tu mobiliario personalizado con CREART.</p>
          <Link to="/contact" className="inline-block bg-white text-teal-600 py-3 px-6 md:px-8 rounded-full font-semibold hover:bg-gray-100 transition text-sm md:text-base">
            Solicitar Cotización
          </Link>
        </div>
      </section>

      {/* WhatsApp Float */}
      <a href="https://wa.me/573159934696" target="_blank" className="whatsapp-float">
        <i className="fab fa-whatsapp"></i>
      </a>
    </div>
  )
}
