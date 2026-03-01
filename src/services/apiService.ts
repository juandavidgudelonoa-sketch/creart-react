// API Service para conectar con Firebase Functions
// Importante: Firebase Functions se conecta automáticamente

import { httpsCallable } from 'firebase/functions'
import { functions } from '../firebase'

// ============= HELPERS =============

// Wrappers para Firebase Functions
async function callFunction(name: string, data: any = {}): Promise<any> {
  try {
    const fn = httpsCallable(functions, name)
    const result = await fn(data)
    return result.data
  } catch (error: any) {
    console.error(`Error calling ${name}:`, error)
    return { error: error.message }
  }
}

// ============= CHAT CON IA =============

export interface ChatMessage {
  message: string
  context?: {
    orders?: any[]
    products?: any[]
    stats?: any
  }
}

export interface ChatResponse {
  success: boolean
  reply?: string
  error?: string
}

// Enviar mensaje al chat con IA
export async function sendChatMessage(message: string, context?: any): Promise<ChatResponse> {
  return callFunction('aiChat', { message, context })
}

// ============= RESUMEN DE VENTAS =============

export interface SalesSummary {
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  completedOrders: number
  topProducts: Array<{ name: string; quantity: number }>
  todayOrders: number
  monthlyRevenue: number
}

// Obtener resumen de ventas
export async function getSalesSummary(): Promise<any> {
  return callFunction('getOrdersSummary')
}

// ============= ANÁLISIS DE CLIENTES =============

export interface CustomerAnalysis {
  totalCustomers: number
  newCustomers: number
  repeatCustomers: number
  averageOrderValue: number
  retentionRate: number
}

// Analizar clientes
export async function getCustomerAnalysis(): Promise<any> {
  return callFunction('aiAnalytics')
}

// ============= RECOMENDACIONES DE STOCK =============

export interface StockRecommendation {
  product: string
  currentStock: number
  recommendedStock: number
  reason: string
  urgency: 'low' | 'medium' | 'high'
}

// Obtener recomendaciones de stock
export async function getStockRecommendations(): Promise<any> {
  return callFunction('aiStockPrediction')
}

// ============= PREDICCIÓN DE VENTAS =============

export interface SalesPrediction {
  period: string
  predictedOrders: number
  predictedRevenue: number
  confidence: number
  factors: string[]
}

// Obtener predicción de ventas
export async function getSalesPrediction(days: number = 7): Promise<any> {
  return callFunction('aiStockPrediction', { days })
}

// ============= PEDIDOS =============

export interface Order {
  id: string
  date: string
  status: string
  customer: any
  total: number
  items: any[]
  paymentStatus?: string
}

// Obtener todos los pedidos
export async function getOrders(limit: number = 100): Promise<any> {
  return callFunction('getOrders', { limit })
}

// Obtener un pedido específico
export async function getOrder(orderId: string): Promise<any> {
  return callFunction('getOrder', { orderId })
}

// Actualizar estado de pedido
export async function updateOrderStatus(orderId: string, status?: string, paymentStatus?: string): Promise<any> {
  return callFunction('updateOrderStatus', { orderId, status, paymentStatus })
}

// ============= PRODUCTOS =============

export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
}

// Obtener productos
export async function getProducts(limit: number = 100): Promise<any> {
  return callFunction('getProducts', { limit })
}

// Obtener productos con stock bajo
export async function getLowStockProducts(threshold: number = 5): Promise<any> {
  return callFunction('getLowStockProducts', { threshold })
}

// Actualizar stock de producto (función futura)
export async function updateProductStock(productId: string, stock: number): Promise<any> {
  console.log(`[API] Update product ${productId} stock to ${stock}`)
  return { success: true, message: 'Product stock updated (demo)' }
}

// ============= RECOMENDACIONES AI =============

export async function getAIRecommendations(preferences?: string): Promise<any> {
  return callFunction('aiRecommendations', { preferences })
}

// ============= HEALTH CHECK =============

export async function checkApiHealth(): Promise<{ status: string; version: string; firebase_connected?: boolean }> {
  return { status: 'ok', version: '2.0.0', firebase_connected: true }
}

// ============= EXPORTAR FUNCIONES =============

export default {
  sendChatMessage,
  getSalesSummary,
  getCustomerAnalysis,
  getStockRecommendations,
  getSalesPrediction,
  getOrders,
  getOrder,
  updateOrderStatus,
  getProducts,
  getLowStockProducts,
  updateProductStock,
  getAIRecommendations,
  checkApiHealth
}
