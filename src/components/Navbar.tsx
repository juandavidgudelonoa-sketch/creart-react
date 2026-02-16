import { Link, useLocation } from 'react-router'
import { useApp } from '../context/AppContext'
import { Heart, ShoppingCart, User, Menu, X, LogOut, GitCompare, History, Settings, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import SearchBar from './SearchBar'
import NotificationsDropdown from './NotificationsDropdown'

// Categorías para el menú desplegable
const categories = [
  { id: 'sillas', name: 'Sillas' },
  { id: 'mesas', name: 'Mesas' },
  { id: 'taburetes', name: 'Taburetes' },
  { id: 'aparadores', name: 'Aparadores' },
  { id: 'armarios', name: 'Armarios' },
  { id: 'zapateras', name: 'Zapateras' },
  { id: 'repisas', name: 'Repisas' },
  { id: 'escritorios', name: 'Escritorios' },
]

export default function Navbar() {
  const { cartCount, wishlistCount, isLoggedIn, logout, compareList, user, wishlist, viewedProducts } = useApp()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [wishlistOpen, setWishlistOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const isAdmin = user?.isAdmin === true

  const isActive = (path: string) => location.pathname === path

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center flex-wrap gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/favicon.png" 
            alt="CREART" 
            className="h-16 w-auto object-contain"
          />
          <h1 className="text-2xl font-bold text-gray-800">CREART</h1>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:block flex-1 max-w-md mx-4">
          <SearchBar />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-3">
          <Link to="/" className={`font-medium hover:text-orange-500 transition ${isActive('/') ? 'text-orange-500' : ''}`}>
            Inicio
          </Link>
          
          {/* Catálogo Dropdown - Grupo completo para hover */}
          <div className="relative group">
            <Link 
              to="/catalog" 
              className={`font-medium hover:text-orange-500 transition flex items-center gap-1 py-4 ${isActive('/catalog') ? 'text-orange-500' : ''}`}
            >
              Catálogo
              <ChevronDown className="w-4 h-4 transition-transform group-hover:rotate-180" />
            </Link>
            
            {/* Dropdown Menu - Aparece al hacer hover en el grupo */}
            <div className="absolute top-full left-0 mt-0 w-56 bg-white rounded-lg shadow-xl py-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <Link 
                to="/catalog" 
                className="block px-4 py-3 hover:bg-teal-50 hover:text-teal-600 transition border-b"
              >
                📦 Ver Todo el Catálogo
              </Link>
              {categories.map(cat => (
                <Link 
                  key={cat.id}
                  to={`/catalog/${cat.id}`} 
                  className={`block px-4 py-3 hover:bg-teal-50 hover:text-teal-600 transition flex items-center gap-2 ${isActive(`/catalog/${cat.id}`) ? 'text-teal-600 bg-teal-50' : ''}`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          
          <Link to="/contact" className={`font-medium hover:text-orange-500 transition ${isActive('/contact') ? 'text-orange-500' : ''}`}>
            Contacto
          </Link>
        </nav>

        {/* Icons */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <NotificationsDropdown />
          
          {/* Compare */}
          <Link to="/compare" className="relative p-2 hover:text-teal-600 transition" title="Comparar">
            <GitCompare className={`w-6 h-6 ${isActive('/compare') ? 'text-teal-600' : ''}`} />
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {compareList.length}
              </span>
            )}
          </Link>
          
          {/* History con Dropdown */}
          <div className="relative">
            <button type="button" onClick={() => setHistoryOpen(!historyOpen)} className="p-2 hover:text-teal-600 transition" title="Historial">
              <History className={`w-6 h-6 ${isActive('/history') ? 'text-teal-600' : ''}`} />
            </button>
            {historyOpen && viewedProducts && viewedProducts.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                <div className="p-3 border-b bg-gradient-to-r from-teal-50 to-blue-50">
                  <h3 className="font-bold text-gray-800">🕐 Historial</h3>
                  <p className="text-xs text-gray-500">{viewedProducts.length} productos visitados</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {viewedProducts.slice(0, 5).map((p: any) => (
                    <Link key={p.id} to={'/product?product=' + p.id} onClick={() => setHistoryOpen(false)} className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-teal-50 hover:to-blue-50 border-b border-gray-50 transition">
                      <img src={p.image || '/logo.jpg'} alt={p.name} className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-orange-600 font-semibold">${p.price?.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link to="/history" onClick={() => setHistoryOpen(false)} className="block p-3 text-center text-sm font-semibold text-teal-600 bg-gray-50 hover:bg-teal-50 border-t">
                  📜 Ver todo el historial →
                </Link>
              </div>
            )}
          </div>
          
          {/* Wishlist con Dropdown */}
          <div className="relative">
            <button type="button" onClick={() => setWishlistOpen(!wishlistOpen)} className="relative p-2 hover:text-red-500 transition">
              <Heart className={`w-6 h-6 ${isActive('/wishlist') ? 'text-red-500' : ''} ${wishlistOpen ? 'fill-red-500' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </button>
            {wishlistOpen && wishlist && wishlist.length > 0 && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fadeIn">
                <div className="p-3 border-b bg-gradient-to-r from-red-50 to-pink-50">
                  <h3 className="font-bold text-gray-800">❤️ Mis Favoritos</h3>
                  <p className="text-xs text-gray-500">{wishlist.length} productos guardados</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {wishlist.slice(0, 5).map((p: any) => (
                    <Link key={p.id} to={'/product?product=' + p.id} onClick={() => setWishlistOpen(false)} className="flex items-center gap-3 p-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 border-b border-gray-50 transition">
                      <img src={p.image || '/logo.jpg'} alt={p.name} className="w-12 h-12 object-cover rounded-lg shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                        <p className="text-xs text-orange-600 font-semibold">${p.price?.toLocaleString()}</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link to="/wishlist" onClick={() => setWishlistOpen(false)} className="block p-3 text-center text-sm font-semibold text-red-600 bg-gray-50 hover:bg-red-50 border-t">
                  ❤️ Ver todos mis favoritos →
                </Link>
              </div>
            )}
          </div>
          
          {/* Cart */}
          <Link to="/cart" className="relative p-2 hover:text-teal-600 transition">
            <ShoppingCart className={`w-6 h-6 ${isActive('/cart') ? 'text-teal-600' : ''}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {isLoggedIn ? (
            <div className="flex items-center gap-1">
              <Link to="/profile" className="p-2 hover:text-teal-600 transition" title="Mi Perfil">
                <User className="w-6 h-6" />
              </Link>
              {isAdmin && (
                <Link to="/admin" className="p-2 hover:text-orange-600 transition" title="Panel de Admin">
                  <Settings className="w-6 h-6" />
                </Link>
              )}
              <button 
                onClick={logout} 
                className="p-2 hover:text-red-500 transition" 
                title="Cerrar Sesión"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-medium hover:opacity-90 transition">
              Ingresar
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden container mx-auto px-4 pb-4">
        <SearchBar />
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden bg-white border-t p-4 space-y-2">
          <Link to="/" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
          <div className="border-t my-2"></div>
          <p className="text-sm font-semibold text-gray-500 py-1">Catálogo</p>
          <Link to="/catalog" className="block py-2 pl-4" onClick={() => setMobileMenuOpen(false)}>📦 Ver Todo</Link>
          {categories.map(cat => (
            <Link 
              key={cat.id}
              to={`/catalog/${cat.id}`} 
              className="block py-2 pl-4"
              onClick={() => setMobileMenuOpen(false)}
            >
              {cat.name}
            </Link>
          ))}
          <div className="border-t my-2"></div>
          <Link to="/compare" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Comparar</Link>
          <Link to="/history" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Historial</Link>
          <Link to="/contact" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Contacto</Link>
          {isLoggedIn && <Link to="/admin" className="block py-2" onClick={() => setMobileMenuOpen(false)}>Admin</Link>}
        </nav>
      )}
    </header>
  )
}
