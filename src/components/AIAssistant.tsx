import { useState, useEffect } from 'react'
import { MessageSquare, TrendingUp, Users, Package, Brain, Send, Loader2 } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { 
  sendChatMessage, 
  getSalesSummary, 
  getCustomerAnalysis, 
  getStockRecommendations,
  getSalesPrediction,
  checkApiHealth
} from '../services/apiService'

interface ChatMessageType {
  id: number
  role: 'user' | 'ai'
  content: string
  timestamp: Date
}

export default function AIAssistant() {
  const { orders, products } = useApp()
  
  // Chat state - persist in localStorage
  const [messages, setMessages] = useState<ChatMessageType[]>(() => {
    const saved = localStorage.getItem('creart_ai_messages')
    return saved ? JSON.parse(saved) : []
  })
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Data state
  const [salesData, setSalesData] = useState<any>(null)
  const [customerData, setCustomerData] = useState<any>(null)
  const [stockData, setStockData] = useState<any[]>([])
  const [predictionData, setPredictionData] = useState<any>(null)
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [activeTab, setActiveTab] = useState<'chat' | 'analytics' | 'stock' | 'prediction'>('chat')
  const [isLoadingData, setIsLoadingData] = useState(false)

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('creart_ai_messages', JSON.stringify(messages))
    }
  }, [messages])

  // Check API health on mount
  useEffect(() => {
    checkApiHealth()
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'))
  }, [])

  // Load all data when tab changes
  useEffect(() => {
    loadAllData()
  }, [activeTab])

  const loadAllData = async () => {
    setIsLoadingData(true)
    try {
      const salesRes: any = await getSalesSummary()
      setSalesData(salesRes.data || salesRes)

      const customersRes: any = await getCustomerAnalysis()
      setCustomerData(customersRes.data || customersRes)

      const stockRes: any = await getStockRecommendations()
      setStockData(stockRes.data || stockRes)

      const predictionRes: any = await getSalesPrediction(7)
      setPredictionData(predictionRes.data || predictionRes)
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setIsLoadingData(false)
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: ChatMessageType = {
      id: Date.now(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const context = {
        orders: orders.slice(0, 50),
        products: products.slice(0, 20),
        stats: {
          totalOrders: orders.length,
          totalProducts: products.length
        }
      }

      const response: any = await sendChatMessage(inputMessage, context)
      
      const aiMessage: ChatMessageType = {
        id: Date.now() + 1,
        role: 'ai',
        content: response.reply || response.data?.reply || 'No pude procesar tu mensaje.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: ChatMessageType = {
        id: Date.now() + 1,
        role: 'ai',
        content: 'Error de conexión. Intenta de nuevo.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const tabs = [
    { id: 'chat', label: 'Chat IA', icon: MessageSquare },
    { id: 'analytics', label: 'Análisis', icon: TrendingUp },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'prediction', label: 'Predicción', icon: Brain },
  ]

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Asistente IA</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${apiStatus === 'online' ? 'bg-green-400' : apiStatus === 'offline' ? 'bg-red-400' : 'bg-yellow-400'}`}></span>
            <span className="text-white text-sm">
              {apiStatus === 'online' ? 'Conectado' : apiStatus === 'offline' ? 'Desconectado' : 'Verificando...'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === tab.id 
                ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4" style={{ maxHeight: '500px', overflowY: 'auto' }}>
        
        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="flex flex-col h-96">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 p-2 bg-gray-50 rounded-lg">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>¡Hola! Soy el asistente IA de CREART.</p>
                  <p className="text-sm">Pregúntame sobre pedidos, ventas, productos o clientes.</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-teal-600 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-teal-200' : 'text-gray-500'}`}>
                        {msg.timestamp.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 p-3 rounded-lg">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={isLoading || apiStatus === 'offline'}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim() || apiStatus === 'offline'}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === 'analytics' && isLoadingData && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        )}

        {activeTab === 'analytics' && !isLoadingData && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" /> Resumen de Ventas
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{salesData?.totalOrders || 0}</p>
                  <p className="text-sm text-gray-600">Pedidos Totales</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{formatPrice(salesData?.totalRevenue || 0)}</p>
                  <p className="text-sm text-gray-600">Ingresos Totales</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">{salesData?.pendingOrders || 0}</p>
                  <p className="text-sm text-gray-600">Pendientes</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-2xl font-bold text-teal-600">{salesData?.todayOrders || 0}</p>
                  <p className="text-sm text-gray-600">Hoy</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg">
              <h3 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" /> Análisis de Clientes
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{customerData?.totalCustomers || 0}</p>
                  <p className="text-sm text-gray-600">Total Clientes</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{customerData?.newCustomers || 0}</p>
                  <p className="text-sm text-gray-600">Nuevos</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{customerData?.repeatCustomers || 0}</p>
                  <p className="text-sm text-gray-600">Recurrentes</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{formatPrice(customerData?.averageOrderValue || 0)}</p>
                  <p className="text-sm text-gray-600">Ticket Promedio</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STOCK TAB */}
        {activeTab === 'stock' && isLoadingData && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        )}

        {activeTab === 'stock' && !isLoadingData && (
          <div className="space-y-3">
            {stockData.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No hay recomendaciones de stock disponibles</p>
              </div>
            ) : (
              stockData.map((item, idx) => (
                <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                  item.urgency === 'high' ? 'bg-red-50 border-red-500' :
                  item.urgency === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-green-50 border-green-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{item.product}</p>
                      <p className="text-sm text-gray-600">{item.reason}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Stock: {item.currentStock}</p>
                      <p className="font-bold text-teal-600">→ {item.recommendedStock}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PREDICTION TAB */}
        {activeTab === 'prediction' && isLoadingData && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        )}

        {activeTab === 'prediction' && !isLoadingData && predictionData && (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-lg">
              <h3 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5" /> Predicción: {predictionData.period || 'Próximos 7 días'}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-3xl font-bold text-indigo-600">{predictionData.predictedOrders || 0}</p>
                  <p className="text-sm text-gray-600">Pedidos Previstos</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{formatPrice(predictionData.predictedRevenue || 0)}</p>
                  <p className="text-sm text-gray-600">Ingresos Previstos</p>
                </div>
              </div>
              {predictionData.confidence && (
                <div className="mt-3 bg-white p-3 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Confianza: {Math.round(predictionData.confidence * 100)}%</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${predictionData.confidence * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {predictionData.factors && (
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-bold text-indigo-800 mb-2">Factores considerados:</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  {predictionData.factors.map((factor: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-indigo-500">•</span> {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {predictionData.recommendation && (
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <p className="text-teal-800 font-medium">💡 {predictionData.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
