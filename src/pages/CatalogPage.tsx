import { useParams, Link } from 'react-router'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

export default function CatalogPage() {
  const { category } = useParams()
  const { products, getProductsByCategory } = useApp()

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
  }

  return (
    <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold text-center mb-4 md:mb-8">
        {category ? categoryTitles[category] || category : 'Catálogo Completo'}
      </h1>

      {/* Category Filters - Horizontal scroll on mobile */}
      <div className="flex overflow-x-auto gap-2 md:gap-4 mb-4 md:mb-8 pb-2 md:pb-0 justify-start md:justify-center scrollbar-hide">
        <Link 
          to="/catalog" 
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-sm md:text-base whitespace-nowrap transition ${!category ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Todos
        </Link>
        <Link 
          to="/catalog/sillas" 
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-sm md:text-base whitespace-nowrap transition ${category === 'sillas' ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Sillas
        </Link>
        <Link 
          to="/catalog/mesas" 
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-sm md:text-base whitespace-nowrap transition ${category === 'mesas' ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Mesas
        </Link>
        <Link 
          to="/catalog/taburetes" 
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-sm md:text-base whitespace-nowrap transition ${category === 'taburetes' ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Taburetes
        </Link>
        <Link 
          to="/catalog/aparadores" 
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-sm md:text-base whitespace-nowrap transition ${category === 'aparadores' ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Aparadores
        </Link>
        <Link 
          to="/catalog/armarios" 
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-sm md:text-base whitespace-nowrap transition ${category === 'armarios' ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Armarios
        </Link>
        <Link 
          to="/catalog/zapateras" 
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-sm md:text-base whitespace-nowrap transition ${category === 'zapateras' ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Zapateras
        </Link>
        <Link 
          to="/catalog/repisas" 
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-sm md:text-base whitespace-nowrap transition ${category === 'repisas' ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Repisas
        </Link>
        <Link 
          to="/catalog/escritorios" 
          className={`px-3 md:px-4 py-1.5 md:py-2 rounded-full font-medium text-sm md:text-base whitespace-nowrap transition ${category === 'escritorios' ? 'bg-teal-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Escritorios
        </Link>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
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
