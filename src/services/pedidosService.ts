// Servicio de Pedidos - Usa la colección "orders" de Firestore
import { db } from '../firebase'
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'

// Colección - IMPORTANTE: Usa "orders" que es la colección existente
const ORDERS_COLLECTION = 'orders'

// Estados del sistema
export type PedidoStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado' | 'paid' | 'pending' | 'rejected'

// Mapear estado de MercadoPago -> nuestro estado
export const mapStatus = (mpStatus: string): PedidoStatus => {
  const map: Record<string, PedidoStatus> = {
    'approved': 'aprobado',
    'paid': 'aprobado',
    'rejected': 'rechazado', 
    'in_process': 'pendiente',
    'pending': 'pendiente',
    'cancelled': 'cancelado',
    'refunded': 'cancelado'
  }
  return map[mpStatus] || 'pendiente'
}

// Crear pedido
export const crearPedido = async (pedidoData: any): Promise<string> => {
  const orderId = `ORD-${Date.now()}`
  
  await addDoc(collection(db, ORDERS_COLLECTION), {
    ...pedidoData,
    orderId,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
  
  return orderId
}

// Actualizar estado
export const actualizarEstado = async (orderId: string, status: string, paymentId?: string) => {
  const updateData: any = { 
    status, 
    updatedAt: serverTimestamp() 
  }
  if (paymentId) updateData.paymentId = paymentId
  
  await updateDoc(doc(db, ORDERS_COLLECTION, orderId), updateData)
}

// Suscribir a pedidos (tiempo real)
export const subscribePedidos = (callback: (pedidos: any[]) => void) => {
  const q = query(
    collection(db, ORDERS_COLLECTION), 
    orderBy('createdAt', 'desc'), 
    limit(50)
  )
  
  return onSnapshot(q, (snapshot) => {
    const pedidos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    callback(pedidos)
  })
}

// Get pedidos por estado
export const getPedidosPorEstado = async (status: string) => {
  const q = query(
    collection(db, ORDERS_COLLECTION), 
    where('status', '==', status),
    limit(100)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
}

// Get estadísticas
export const getEstadisticas = async () => {
  const snapshot = await getDocs(collection(db, ORDERS_COLLECTION))
  
  const stats = { total: 0, pendiente: 0, aprobado: 0, rechazado: 0, cancelado: 0 }
  
  snapshot.forEach((doc) => {
    const data = doc.data()
    stats.total++
    switch (data.status) {
      case 'pending': stats.pendiente++; break
      case 'paid':
      case 'approved': stats.aprobado++; break
      case 'rejected': stats.rechazado++; break
      case 'cancelled': stats.cancelado++; break
    }
  })
  
  return stats
}

export default { 
  crearPedido, 
  actualizarEstado, 
  subscribePedidos, 
  getPedidosPorEstado,
  getEstadisticas,
  mapStatus 
}
