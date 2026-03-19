import { useParams, Link } from 'react-router'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'
import { useState } from 'react'
import { ChevronDown, X } from 'lucide-react'

export default function CatalogPage() {
  const { category } = useParams()
  const { products, getProductsByCategory } = useApp()
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const displayProducts = category ? getProductsByCategory(category) : products

  const categoryTitles: Record<string, string> = {
    sillas: 'Sillas',
    mesas: 'Mesas',
    taburetes: 'Taburetes',
    aparadores: 'Aparadores',
    armarios: 'Armarios',
    zapateras: 'Zapateras',
    repisas: 'Repisas',
    escritorios: 'Escritorios',
    'centro-entretenimiento': 'Centro Entretenimiento',
    'mueble-bano': 'Mueble Baño',
  }

  const allCategories = [
    { id: '', name: 'Todos' },
    { id: 'sillas', name: 'Sillas' },
    { id: 'mesas', name: 'Mesas' },
    { id: 'taburetes', name: 'Taburetes' },
    { id: 'aparadores', name: 'Aparadores' },
    { id: 'armarios', name: 'Armarios' },
    { id: 'zapateras', name: 'Zapateras' },
    { id: 'repisas', name: 'Repisas' },
    { id: 'escritorios', name: 'Escritorios' },
    { id: 'centro-entretenimiento', name: 'Centro Entretenimiento' },
    { id: 'mueble-bano', name: 'Mueble Baño' },
  ]

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8">
        {category ? categoryTitles[category] || category : 'Catálogo Completo'}
      </h1>

      {/* Category Filters - Mobile */}
      <div className="md:hidden mb-6">
        <button 
          onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white rounded-lg shadow-md border"
        >
          <span className="font-medium">Filtrar por categoría</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${mobileFilterOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {mobileFilterOpen && (
          <div className="mt-2 bg-white rounded-lg shadow-md border p-4 grid grid-cols-2 gap-2">
            {allCategories.map(cat => (
              <Link 
                key={cat.id}
                to={cat.id ? `/catalog/${cat.id}` : '/catalog'} 
                className={`px-3 py-2 rounded-lg font-medium text-sm text-center transition ${
                  (!category && !cat.id) || category === cat.id 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                onClick={() => setMobileFilterOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Category Filters - Desktop */}
      <div className="hidden md:flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
        {allCategories.map(cat => (
          <Link 
            key={cat.id}
            to={cat.id ? `/catalog/${cat.id}` : '/catalog'} 
            className={`px-3 md:px-4 py-2 rounded-full font-medium text-sm md:text-base transition ${
              (!category && !cat.id) || category === cat.id 
                ? 'bg-teal-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {displayProducts.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-xl">No se encontraron productos en esta categoría.</p>
        </div>
      )}
    </div>
  )
}
