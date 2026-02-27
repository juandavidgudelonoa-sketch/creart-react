// API Service para conectar con Railway
// URL base de la API
const API_BASE = 'https://creart-react-production.up.railway.app'

// URLs alternativas (si falla la principal)
const API_URLS = [
  'https://creart-react-production.up.railway.app',
  'http://creart-react-production.up.railway.app'
]

let currentApiUrl = API_BASE

// Función para hacer requests con fallback
async function apiRequest(endpoint: string, options: RequestInit = {}) {
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

// Enviar mensaje al chat con IA
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

// Obtener resumen de ventas
export async function getSalesSummary(): Promise<SalesSummary> {
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
  topCustomers: Array<{ email: string; orders: number; total: number }>
  averageOrderValue: number
}

// Analizar clientes
export async function getCustomerAnalysis(): Promise<CustomerAnalysis> {
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

// Obtener recomendaciones de stock
export async function getStockRecommendations(): Promise<StockRecommendation[]> {
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

// Obtener predicción de ventas
export async function getSalesPrediction(days: number = 7): Promise<SalesPrediction> {
  return apiRequest('/api/prediction', {
    method: 'POST',
    body: JSON.stringify({ days }),
  })
}

// ============= HEALTH CHECK =============

export async function checkApiHealth(): Promise<{ status: string; version: string }> {
  return apiRequest('/api/health')
}
