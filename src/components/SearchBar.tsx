import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router'
import { Search, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function SearchBar() {
  const { searchProducts, setSearchQuery, searchQuery, addToCart } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<ReturnType<typeof searchProducts>>([])
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchQuery.length > 1) {
      setResults(searchProducts(searchQuery))
    } else {
      setResults([])
    }
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const formatPrice = (price: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price)

  return (
    <div ref={searchRef} className="relative">
      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setIsOpen(true) }}
          onFocus={() => setIsOpen(true)}
          className="bg-transparent border-none outline-none ml-2 w-32 md:w-48"
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(''); setResults([]) }}>
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white shadow-xl rounded-lg z-[9999] max-h-96 overflow-auto border-2 border-teal-500">
          {results.map(product => (
            <div key={product.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-2xl">
                {product.category === 'sillas' ? '🪑' : product.category === 'mesas' ? '🪵' : '🪑'}
              </div>
              <div className="flex-1">
                <Link to={`/catalog?product=${product.id}`} onClick={() => { setIsOpen(false); setSearchQuery('') }} className="font-medium hover:text-teal-600">
                  {product.name}
                </Link>
                <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
              </div>
              <button onClick={() => { addToCart(product); setIsOpen(false) }} className="bg-teal-600 text-white px-3 py-1 rounded text-sm">
                Agregar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
