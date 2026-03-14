import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './config'
import type { Product, Order, User } from '../context/AppContext'

const PRODUCTS_COLLECTION = 'products'
const ORDERS_COLLECTION = 'orders'
const USERS_COLLECTION = 'users'

export const productService = {
  async getAll(): Promise<Product[]> {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION))
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product))
  },

  async getById(id: string): Promise<Product | null> {
    const docRef = doc(db, PRODUCTS_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product
    }
    return null
  },

  async getByCategory(category: string): Promise<Product[]> {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('category', '==', category)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product))
  },

  async create(product: Omit<Product, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...product,
      createdAt: serverTimestamp()
    })
    return docRef.id
  },

  async update(id: string, product: Partial<Product>): Promise<void> {
    const docRef = doc(db, PRODUCTS_COLLECTION, id)
    await updateDoc(docRef, {
      ...product,
      updatedAt: serverTimestamp()
    })
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, PRODUCTS_COLLECTION, id)
    await deleteDoc(docRef)
  }
}

export const orderService = {
  async getAll(): Promise<Order[]> {
    const q = query(
      collection(db, ORDERS_COLLECTION),
      orderBy('date', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Order))
  },

  async getById(id: string): Promise<Order | null> {
    const docRef = doc(db, ORDERS_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Order
    }
    return null
  },

  async create(order: Omit<Order, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...order,
      createdAt: serverTimestamp()
    })
    return docRef.id
  },

  async updateStatus(id: string, status: Order['status']): Promise<void> {
    const docRef = doc(db, ORDERS_COLLECTION, id)
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    })
  }
}

export const userService = {
  async getById(id: string): Promise<User | null> {
    const docRef = doc(db, USERS_COLLECTION, id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User
    }
    return null
  },

  async create(user: Omit<User, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, USERS_COLLECTION), {
      ...user,
      createdAt: serverTimestamp()
    })
    return docRef.id
  },

  async update(id: string, userData: Partial<User>): Promise<void> {
    const docRef = doc(db, USERS_COLLECTION, id)
    await updateDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp()
    })
  }
}
