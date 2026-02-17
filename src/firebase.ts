import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC8tZwZfuoGIjZA1lgxxS3pvyn914rn1w4",
  authDomain: "creart-313b9.firebaseapp.com",
  projectId: "creart-313b9",
  storageBucket: "creart-313b9.firebasestorage.app",
  messagingSenderId: "31991580347",
  appId: "1:31991580347:web:6cd0a0f1f84699a0d84b9e",
  measurementId: "G-DFKDKJFY24"
}

// Inicializar Firebase
export const app = initializeApp(firebaseConfig)

// Autenticación
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Firestore
export const db = getFirestore(app)
