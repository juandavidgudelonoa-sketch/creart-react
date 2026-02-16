import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react'
import type { Customer, User } from '../types'

interface AuthContextType {
  user: User | null
  customer: Customer
  isLoggedIn: boolean
  isAdmin: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  setCustomer: (customer: Customer) => void
  saveCustomer: () => void
  loadCustomer: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const defaultCustomer: Customer = {
  name: '',
  phone: '',
  email: '',
  address: ''
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null
    const saved = localStorage.getItem('creart_user')
    return saved ? JSON.parse(saved) : null
  })

  const [customer, setCustomerState] = useState<Customer>(() => {
    if (typeof window === 'undefined') return defaultCustomer
    const saved = localStorage.getItem('creart_customer')
    return saved ? JSON.parse(saved) : defaultCustomer
  })

  const isLoggedIn = useMemo(() => user !== null, [user])
  const isAdmin = useMemo(() => user?.isAdmin === true, [user])

  const login = useCallback((email: string, password: string): boolean => {
    // Simulación de login - en producción esto vendría de backend
    const mockUsers = [
      { id: '1', email: 'admin@creart.com', password: 'admin123', name: 'Administrador', isAdmin: true },
      { id: '2', email: 'cliente@ejemplo.com', password: 'cliente123', name: 'Cliente', isAdmin: false }
    ]
    
    const foundUser = mockUsers.find(u => u.email === email && u.password === password)
    
    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword as User)
      localStorage.setItem('creart_user', JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('creart_user')
  }, [])

  const setCustomer = useCallback((newCustomer: Customer) => {
    setCustomerState(newCustomer)
  }, [])

  const saveCustomer = useCallback(() => {
    localStorage.setItem('creart_customer', JSON.stringify(customer))
  }, [customer])

  const loadCustomer = useCallback(() => {
    const saved = localStorage.getItem('creart_customer')
    if (saved) {
      setCustomerState(JSON.parse(saved))
    }
  }, [])

  const value = useMemo(() => ({
    user,
    customer,
    isLoggedIn,
    isAdmin,
    login,
    logout,
    setCustomer,
    saveCustomer,
    loadCustomer,
  }), [user, customer, isLoggedIn, isAdmin, login, logout, setCustomer, saveCustomer, loadCustomer])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
