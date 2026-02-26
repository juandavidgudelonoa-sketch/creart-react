// Hook simple para pedidos con Firebase en tiempo real
import { useState, useEffect } from 'react'
import { crearPedido, subscribePedidos, actualizarEstado, PedidoStatus } from '../services/pedidosService'

interface UsePedidosReturn {
  pedidos: any[]
  loading: boolean
  crear: (data: any) => Promise<string>
  actualizar: (id: string, estado: PedidoStatus) => Promise<void>
}

export function usePedidos(): UsePedidosReturn {
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribePedidos((actualizados) => {
      setPedidos(actualizados)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const crear = async (data: any): Promise<string> => {
    return await crearPedido(data)
  }

  const actualizar = async (id: string, estado: PedidoStatus): Promise<void> => {
    await actualizarEstado(id, estado)
  }

  return { pedidos, loading, crear, actualizar }
}

export default usePedidos
