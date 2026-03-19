import { Navigate, useLocation } from 'react-router'
import { useAuth } from '../contexts/AuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  // Debug: mostrar estado en consola
  console.log('🔐 ProtectedRoute - user:', user?.email)
  console.log('🔐 ProtectedRoute - isAdmin:', isAdmin)
  console.log('🔐 ProtectedRoute - loading:', loading)
  console.log('🔐 ProtectedRoute - requireAdmin:', requireAdmin)

  // Mientras carga, mostrar spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-600 mb-4" />
          <p className="text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no está logueado, redirigir a login
  if (!user) {
    console.log('🔐 Redirect: No está logueado → /login')
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Si requiere admin y no es admin, redirigir al home
  if (requireAdmin && !isAdmin) {
    console.log('🔐 Redirect: No es admin → /')
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
