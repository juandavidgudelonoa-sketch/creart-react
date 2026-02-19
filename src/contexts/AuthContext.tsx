import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from '../firebase'
import type { Customer, User } from '../types'

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  customer: Customer
  isLoggedIn: boolean
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message: string }>
  loginWithGoogle: () => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  setCustomer: (customer: Customer) => void
  saveCustomer: () => Promise<void>
  loadCustomer: () => Promise<void>
  updateUserProfile: (name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const defaultCustomer: Customer = {
  name: '',
  phone: '',
  email: '',
  address: ''
}

// Función para verificar si es admin
const checkIsAdmin = async (email: string): Promise<boolean> => {
  if (!email) return false
  
  // TEMPORAL: Hardcodear email de admin para pruebas
  const adminEmail = 'juandavidgudelonoa@gmail.com'
  if (email.toLowerCase() === adminEmail.toLowerCase()) {
    console.log('✅ Usuario es ADMIN (hardcoded)')
    return true
  }
  
  try {
    // Verificar documento específico "admin" con ID "admin"
    const adminDoc = await getDoc(doc(db, 'admin', 'admin'))
    if (adminDoc.exists()) {
      const data = adminDoc.data()
      console.log('📋 Datos del admin en Firestore:', data)
      console.log('📧 Email del usuario:', email)
      
      // Comparar emails ignorando mayúsculas/minúsculas
      const adminEmailFirestore = (data.email || '').toLowerCase().trim()
      const userEmail = email.toLowerCase().trim()
      
      console.log('📧 Admin email (lower):', adminEmailFirestore)
      console.log('📧 User email (lower):', userEmail)
      console.log('📧 Emails son iguales:', adminEmailFirestore === userEmail)
      console.log('📋 Role:', data.role)
      
      // Verificar si el email del usuario coincide con el admin registrado
      if (adminEmail === userEmail && data.role === 'admin') {
        console.log('✅ Usuario es ADMIN')
        return true
      } else {
        console.log('❌ No es admin - email no coincide o role incorrecto')
      }
    } else {
      console.log('❌ No existe documento admin en Firestore')
    }
    return false
  } catch (error) {
    console.error('Error checking admin:', error)
    return false
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [customer, setCustomerState] = useState<Customer>(() => {
    if (typeof window === 'undefined') return defaultCustomer
    const saved = localStorage.getItem('creart_customer')
    return saved ? JSON.parse(saved) : defaultCustomer
  })
  const [loading, setLoading] = useState(true)

  const isLoggedIn = useMemo(() => firebaseUser !== null, [firebaseUser])
  const isAdmin = useMemo(() => user?.isAdmin === true, [user])

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser)
      if (fbUser) {
        const isAdminUser = await checkIsAdmin(fbUser.email || '')
        const userData: User = {
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || '',
          isAdmin: isAdminUser
        }
        setUser(userData)
        // Cargar datos del cliente desde Firestore
        try {
          const customerDoc = await getDoc(doc(db, 'customers', fbUser.uid))
          if (customerDoc.exists()) {
            setCustomerState(customerDoc.data() as Customer)
          } else {
            // Crear cliente nuevo si no existe
            const newCustomer: Customer = {
              name: fbUser.displayName || '',
              email: fbUser.email || '',
              phone: '',
              address: ''
            }
            setCustomerState(newCustomer)
          }
        } catch (error) {
          console.error('Error loading customer:', error)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true)
      const result = await signInWithEmailAndPassword(auth, email, password)
      const isAdminUser = await checkIsAdmin(result.user.email || '')
      
      const userData: User = {
        id: result.user.uid,
        email: result.user.email || '',
        name: result.user.displayName || result.user.email?.split('@')[0] || '',
        isAdmin: isAdminUser
      }
      setUser(userData)
      return { success: true, message: 'Login exitoso' }
    } catch (error: any) {
      console.error('Login error:', error)
      let message = 'Error al iniciar sesión'
      if (error.code === 'auth/invalid-email') {
        message = 'Email inválido'
      } else if (error.code === 'auth/user-not-found') {
        message = 'Usuario no encontrado'
      } else if (error.code === 'auth/wrong-password') {
        message = 'Contraseña incorrecta'
      } else if (error.code === 'auth/invalid-credential') {
        message = 'Credenciales incorrectas'
      }
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true)
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Actualizar perfil con el nombre
      await updateProfile(result.user, { displayName: name })
      
      // Guardar en Firestore
      const newCustomer: Customer = {
        name,
        email,
        phone: '',
        address: ''
      }
      await setDoc(doc(db, 'customers', result.user.uid), {
        ...newCustomer,
        createdAt: serverTimestamp()
      })
      
      setCustomerState(newCustomer)
      return { success: true, message: 'Registro exitoso' }
    } catch (error: any) {
      console.error('Register error:', error)
      let message = 'Error al registrarse'
      if (error.code === 'auth/email-already-in-use') {
        message = 'El email ya está registrado'
      } else if (error.code === 'auth/invalid-email') {
        message = 'Email inválido'
      } else if (error.code === 'auth/weak-password') {
        message = 'La contraseña debe tener al menos 6 caracteres'
      }
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    try {
      setLoading(true)
      const result = await signInWithPopup(auth, googleProvider)
      const isAdminUser = await checkIsAdmin(result.user.email || '')
      
      // Verificar si ya existe el cliente
      const customerDoc = await getDoc(doc(db, 'customers', result.user.uid))
      if (!customerDoc.exists()) {
        const newCustomer: Customer = {
          name: result.user.displayName || '',
          email: result.user.email || '',
          phone: '',
          address: ''
        }
        await setDoc(doc(db, 'customers', result.user.uid), {
          ...newCustomer,
          createdAt: serverTimestamp()
        })
        setCustomerState(newCustomer)
      }
      
      return { success: true, message: 'Login con Google exitoso' }
    } catch (error: any) {
      console.error('Google login error:', error)
      let message = 'Error con Google'
      if (error.code === 'auth/popup-closed-by-user') {
        message = 'Ventana cerrada por el usuario'
      }
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await signOut(auth)
      setUser(null)
      setFirebaseUser(null)
      setCustomerState(defaultCustomer)
      localStorage.removeItem('creart_customer')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  const setCustomer = useCallback((newCustomer: Customer) => {
    setCustomerState(newCustomer)
  }, [])

  const saveCustomer = useCallback(async () => {
    if (firebaseUser) {
      try {
        await setDoc(doc(db, 'customers', firebaseUser.uid), {
          ...customer,
          updatedAt: serverTimestamp()
        }, { merge: true })
        localStorage.setItem('creart_customer', JSON.stringify(customer))
      } catch (error) {
        console.error('Error saving customer:', error)
      }
    }
  }, [customer, firebaseUser])

  const loadCustomer = useCallback(async () => {
    if (firebaseUser) {
      try {
        const customerDoc = await getDoc(doc(db, 'customers', firebaseUser.uid))
        if (customerDoc.exists()) {
          setCustomerState(customerDoc.data() as Customer)
        }
      } catch (error) {
        console.error('Error loading customer:', error)
      }
    }
  }, [firebaseUser])

  const updateUserProfile = useCallback(async (name: string) => {
    if (firebaseUser) {
      try {
        await updateProfile(firebaseUser, { displayName: name })
        setUser(prev => prev ? { ...prev, name } : null)
      } catch (error) {
        console.error('Error updating profile:', error)
      }
    }
  }, [firebaseUser])

  const value = useMemo(() => ({
    user,
    firebaseUser,
    customer,
    isLoggedIn,
    isAdmin,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    setCustomer,
    saveCustomer,
    loadCustomer,
    updateUserProfile
  }), [user, firebaseUser, customer, isLoggedIn, isAdmin, loading, login, register, loginWithGoogle, logout, setCustomer, saveCustomer, loadCustomer, updateUserProfile])

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
