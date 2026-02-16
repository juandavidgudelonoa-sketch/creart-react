import { useState } from 'react'
import { useNavigate } from 'react-router'
import { LogIn, Shield, CheckCircle } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [loginType, setLoginType] = useState<'user' | 'admin'>('user')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const { setUser, setCustomer, saveCustomer } = useApp()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (loginType === 'admin') {
      // Credenciales de admin
      if (email === 'admin@creart.com' && password === 'admin123') {
        const adminUser = {
          id: 'admin-1',
          name: 'Administrador',
          email: 'admin@creart.com',
          interests: [],
          isAdmin: true,
        }
        setUser(adminUser)
        navigate('/admin')
        return
      } else {
        setError('Credenciales de administrador incorrectas')
        return
      }
    }

    // Si es registro (no login)
    if (!isLogin) {
      // Guardar datos del cliente para que aparezcan en Mi Perfil
      setCustomer({
        name: name,
        phone: '',
        email: email,
        address: ''
      })
      saveCustomer()
      
      // Mostrar mensaje de éxito
      setRegisterSuccess(true)
      
      // Después de 2 segundos, hacer login automáticamente
      setTimeout(() => {
        const newUser = {
          id: Date.now().toString(),
          name: name,
          email: email,
          interests: ['Muebles', 'Carpintería'],
          isAdmin: false,
        }
        setUser(newUser)
        navigate('/catalog')
      }, 2000)
      return
    }

    // Login de usuario normal
    const newUser = {
      id: Date.now().toString(),
      name: 'Usuario Demo',
      email,
      interests: ['Muebles', 'Carpintería'],
      isAdmin: false,
    }

    setUser(newUser)
    navigate('/catalog')
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-teal-500 p-8 text-white text-center">
          <div className="flex flex-col items-center gap-2">
            <img 
              src="/favicon.png" 
              alt="CREART" 
              className="h-20 w-auto object-contain"
            />
            <h1 className="text-3xl font-bold">CREART</h1>
            <p className="text-white/80">Muebles Personalizados</p>
          </div>
        </div>

        <div className="p-8">
          {/* Tipo de login */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setLoginType('user'); setError('') }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                loginType === 'user'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <LogIn className="w-5 h-5 inline mr-2" />
              Usuario
            </button>
            <button
              onClick={() => { setLoginType('admin'); setError('') }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                loginType === 'admin'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Shield className="w-5 h-5 inline mr-2" />
              Admin
            </button>
          </div>

          {loginType === 'admin' && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                <strong>Credenciales:</strong><br/>
                Email: admin@creart.com<br/>
                Contraseña: admin123
              </p>
            </div>
          )}

          {loginType === 'user' && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  isLogin
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                  !isLogin
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Registrarse
              </button>
            </div>
          )}

          {/* Mensaje de registro exitoso */}
          {registerSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-green-700 font-semibold">¡Cuenta creada exitosamente!</p>
              <p className="text-green-600 text-sm">Iniciando sesión...</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginType === 'user' && !isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Tu nombre"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginType === 'admin' ? 'Email de Administrador' : 'Email'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={loginType === 'admin' ? 'admin@creart.com' : 'tu@email.com'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {loginType === 'admin' ? 'Contraseña de Administrador' : 'Contraseña'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder={loginType === 'admin' ? 'admin123' : '••••••••'}
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg ${
                loginType === 'admin' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gradient-to-r from-orange-500 to-teal-500 text-white'
              }`}
            >
              {loginType === 'admin' ? 'Entrar como Admin' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
            </button>
          </form>

          {loginType === 'user' && (
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Datos de demostración - No se requiere contraseña real</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
