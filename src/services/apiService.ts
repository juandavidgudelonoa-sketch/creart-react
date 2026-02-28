// API Service para conectar con Railway
// URL base de la API - usa el backend actual
const API_BASE = 'https://creart-react-production.up.railway.app'

// URLs alternativas para fallback
const API_URLS = [
  'https://creart-react-production.up.railway.app',
  'http://creart-react-production.up.railway.app',
  'http://localhost:5000'
]

let currentApiUrl = API_BASE

// Función para hacer requests con fallback
async function apiRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${currentApiUrl}${endpoint}`
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    // Probar URLs alternativas
    for (const altUrl of API_URLS) {
      if (altUrl === currentApiUrl) continue
      
      try {
        const altResponse = await fetch(`${altUrl}${endpoint}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options.headers,
          },
        })
        
        if (altResponse.ok) {
          currentApiUrl = altUrl
          return await altResponse.json()
        }
      } catch {
        continue
      }
    }
    
    throw error
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

// Enviar mensaje al chat con IA (POST)
export async function sendChatMessage(message: string, context?: any): Promise<ChatResponse> {
  return apiRequest('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ message, context }),
  })
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

// Obtener resumen de ventas (POST - versión actual)
export async function getSalesSummary(): Promise<any> {
  return apiRequest('/api/summary', {
    method: 'POST',
    body: JSON.stringify({ type: 'sales' }),
  })
}

// ============= ANÁLISIS DE CLIENTES =============

export interface CustomerAnalysis {
  totalCustomers: number
  newCustomers: number
  repeatCustomers: number
  averageOrderValue: number
  retentionRate: number
}

// Analizar clientes (POST - versión actual)
export async function getCustomerAnalysis(): Promise<any> {
  return apiRequest('/api/analysis', {
    method: 'POST',
    body: JSON.stringify({ type: 'customers' }),
  })
}

// ============= RECOMENDACIONES DE STOCK =============

export interface StockRecommendation {
  product: string
  currentStock: number
  recommendedStock: number
  reason: string
  urgency: 'low' | 'medium' | 'high'
}

// Obtener recomendaciones de stock (POST - versión actual)
export async function getStockRecommendations(): Promise<any> {
  return apiRequest('/api/recommendations', {
    method: 'POST',
    body: JSON.stringify({ type: 'stock' }),
  })
}

// ============= PREDICCIÓN DE VENTAS =============

export interface SalesPrediction {
  period: string
  predictedOrders: number
  predictedRevenue: number
  confidence: number
  factors: string[]
}

// Obtener predicción de ventas (POST - versión actual)
export async function getSalesPrediction(days: number = 7): Promise<any> {
  return apiRequest('/api/prediction', {
    method: 'POST',
    body: JSON.stringify({ days }),
  })
}

// ============= PEDIDOS (usando contexto del frontend) =============

// Los pedidos vienen del contexto de Firebase en el frontend
// Esta función es un wrapper para mantener compatibilidad
export interface Order {
  id: string
  date: string
  status: string
  customer: any
  total: number
  items: any[]
}

// Actualizar estado de pedido (simulado - usa Firebase directamente)
export async function updateOrderStatus(orderId: string, status: string): Promise<any> {
  // Por ahora retorna success - la actualización real se hace en Firebase
  console.log(`[API] Update order ${orderId} to ${status}`)
  return { success: true, message: 'Order status updated' }
}

// ============= PRODUCTOS =============

// Los productos vienen del contexto de Firebase en el frontend
export interface Product {
  id: string
  name: string
  category: string
  price: number
  stock: number
}

// Obtener productos con stock bajo (simulado)
export async function getLowStockProducts(threshold: number = 5): Promise<any> {
  // Por ahora retorna un array vacío - los productos vienen de Firebase
  return { success: true, data: [] }
}

// Actualizar stock (simulado)
export async function updateProductStock(productId: string, stock: number): Promise<any> {
  console.log(`[API] Update product ${productId} stock to ${stock}`)
  return { success: true, message: 'Product stock updated' }
}

// ============= HEALTH CHECK =============

export async function checkApiHealth(): Promise<{ status: string; version: string; firebase_connected?: boolean }> {
  return apiRequest('/api/health')
}

// ============= EXPORTAR FUNCIONES =============

export default {
  sendChatMessage,
  getSalesSummary,
  getCustomerAnalysis,
  getStockRecommendations,
  getSalesPrediction,
  updateOrderStatus,
  getLowStockProducts,
  updateProductStock,
  checkApiHealth
}
