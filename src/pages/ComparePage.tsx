import { Link } from 'react-router'
import { GitCompare, Trash2, ShoppingCart } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function ComparePage() {
  const { compareList, removeFromCompare, clearCompare, addToCart } = useApp()

  const formatPrice = (price: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

  if (compareList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <GitCompare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold mb-4">No hay productos para comparar</h2>
        <p className="text-gray-500 mb-8">Agrega productos desde el catálogo</p>
        <Link to="/catalog" className="bg-teal-600 text-white py-3 px-8 rounded-full font-semibold hover:bg-teal-700">
          Ver Catálogo
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Comparar Productos</h1>
        <button onClick={clearCompare} className="text-red-500 hover:underline flex items-center gap-2">
          <Trash2 className="w-4 h-4" /> Limpiar todo
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr>
              <th className="p-4 text-left bg-gray-50"></th>
              {compareList.map(product => (
                <th key={product.id} className="p-4 text-center border-l">
                  <div className="relative">
                    <button onClick={() => removeFromCompare(product.id)} className="absolute -top-2 -right-2 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-32 h-32 bg-gray-100 mx-auto rounded-lg flex items-center justify-center text-4xl mb-2">
                      {product.category === 'sillas' ? '🪑' : product.category === 'mesas' ? '🪵' : '🪑'}
                    </div>
                    <p className="font-semibold">{product.name}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-4 font-medium">Precio</td>
              {compareList.map(product => (
                <td key={product.id} className="p-4 text-center border-l">
                  <span className="text-xl font-bold text-teal-600">{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <p className="text-sm text-gray-400 line-through">{formatPrice(product.originalPrice)}</p>
                  )}
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="p-4 font-medium">Categoría</td>
              {compareList.map(product => (
                <td key={product.id} className="p-4 text-center border-l capitalize">{product.category}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="p-4 font-medium">Calificación</td>
              {compareList.map(product => (
                <td key={product.id} className="p-4 text-center border-l">
                  <div className="flex justify-center gap-1">
                    {[1,2,3,4,5].map(i => (
                      <span key={i} className={i <= product.rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">({product.reviews} reseñas)</p>
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="p-4 font-medium">Stock</td>
              {compareList.map(product => (
                <td key={product.id} className="p-4 text-center border-l">
                  <span className={product.stock && product.stock > 5 ? 'text-green-600' : 'text-orange-500'}>
                    {product.stock} unidades
                  </span>
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="p-4 font-medium">Descripción</td>
              {compareList.map(product => (
                <td key={product.id} className="p-4 text-center border-l text-sm whitespace-pre-line">{product.description}</td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="p-4 font-medium">Características</td>
              {compareList.map(product => (
                <td key={product.id} className="p-4 text-center border-l">
                  <ul className="text-sm text-left">
                    {product.features?.map((f, i) => <li key={i}>• {f}</li>)}
                  </ul>
                </td>
              ))}
            </tr>
            <tr className="border-t">
              <td className="p-4 font-medium">Acción</td>
              {compareList.map(product => (
                <td key={product.id} className="p-4 text-center border-l">
                  <button onClick={() => addToCart(product)} className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 flex items-center gap-2 mx-auto">
                    <ShoppingCart className="w-4 h-4" /> Agregar
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
