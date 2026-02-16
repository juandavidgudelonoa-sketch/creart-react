import { useApp } from '../context/AppContext'

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pendiente', className: 'bg-yellow-100 text-yellow-700' },
  processing: { label: 'Procesando', className: 'bg-blue-100 text-blue-700' },
  shipped: { label: 'Enviado', className: 'bg-indigo-100 text-indigo-700' },
  completed: { label: 'Completado', className: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', className: 'bg-red-100 text-red-700' },
}

export default function OrdersPage() {
  const { orders } = useApp()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">No tienes pedidos aún</h2>
        <p className="text-gray-500">Cuando realices un pedido, aparecerá aquí.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
              <div>
                <span className="font-bold text-lg">{order.id}</span>
                <span className="text-gray-500 ml-4">{order.date}</span>
              </div>
              <span className={`px-4 py-1 rounded-full text-sm font-medium ${statusLabels[order.status]?.className || 'bg-gray-100 text-gray-700'}`}>
                {statusLabels[order.status]?.label || order.status}
              </span>
            </div>
            
            <div className="border-t pt-4">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between py-2">
                  <span className="text-gray-600">{item.name} x{item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-teal-600">{formatPrice(order.total)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
