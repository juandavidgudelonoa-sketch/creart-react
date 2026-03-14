import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser 
} from 'firebase/auth'
import { auth } from './config'

export const authService = {
  async login(email: string, password: string): Promise<FirebaseUser> {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  },

  async register(email: string, password: string): Promise<FirebaseUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password)
    return result.user
  },

  async logout(): Promise<void> {
    await signOut(auth)
  },

  onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback)
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser
  }
}
