// Cloud Functions para Mercado Pago y Pedidos
// Este archivo se despliega con: firebase deploy --only functions

import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

const db = admin.firestore()

// Mapear estados de MercadoPago a nuestro sistema
type PaymentStatus = 'approved' | 'rejected' | 'in_process' | 'pending' | 'cancelled' | 'refunded'
type PedidoStatus = 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado'

const mapPaymentStatus = (status: PaymentStatus): PedidoStatus => {
  const map: Record<PaymentStatus, PedidoStatus> = {
    'approved': 'aprobado',
    'rejected': 'rechazado',
    'in_process': 'pendiente',
    'pending': 'pendiente',
    'cancelled': 'cancelado',
    'refunded': 'cancelado'
  }
  return map[status] || 'pendiente'
}

/**
 * Webhook de Mercado Pago
 * Recibe notificaciones de pago y actualiza el pedido en Firestore
 */
export const mercadopagoWebhook = functions.https.onRequest(async (req, res) => {
  // Solo permitir POST
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  try {
    const { type, data } = req.body
    
    // Solo procesar eventos de pago
    if (type !== 'payment') {
      res.status(200).send('OK - No es un evento de pago')
      return
    }

    const paymentId = data?.id?.toString()
    
    if (!paymentId) {
      res.status(200).send('OK - Sin payment ID')
      return
    }

    // Buscar pedido por paymentId o preferenceId
    const pedidosSnapshot = await db.collection('pedidos')
      .where('paymentId', '==', paymentId)
      .limit(1)
      .get()

    if (pedidosSnapshot.empty) {
      // Buscar por preferenceId
      const prefSnapshot = await db.collection('pedidos')
        .where('preferenceId', '==', data.preference_id)
        .limit(1)
        .get()

      if (prefSnapshot.empty) {
        console.log(`Pedido no encontrado para paymentId: ${paymentId}`)
        res.status(200).send('OK - Pedido no encontrado')
        return
      }

      const pedidoDoc = prefSnapshot.docs[0]
      
      // Actualizar estado del pedido
      await pedidoDoc.ref.update({
        estado: mapPaymentStatus(data.status as PaymentStatus),
        paymentId: paymentId,
        paymentStatus: data.status,
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp()
      })

      console.log(`Pedido ${pedidoDoc.id} actualizado a: ${data.status}`)
      res.status(200).send('OK')
      return
    }

    // Actualizar pedido encontrado
    const pedidoDoc = pedidosSnapshot.docs[0]
    
    await pedidoDoc.ref.update({
      estado: mapPaymentStatus(data.status as PaymentStatus),
      paymentStatus: data.status,
      actualizadoEn: admin.firestore.FieldValue.serverTimestamp()
    })

    console.log(`Pedido ${pedidoDoc.id} actualizado a: ${data.status}`)
    res.status(200).send('OK')

  } catch (error) {
    console.error('Error en webhook:', error)
    res.status(500).send('Internal Server Error')
  }
})

/**
 * Crear preferencia de pago de Mercado Pago
 */
export const createPaymentPreference = functions.https.onCall(async (data, context) => {
  const { pedidoId, items, total, cliente } = data

  // Aquí iría la integración con Mercado Pago SDK
  // Por ahora retornamos un ejemplo
  const preferenceId = `preference_${Date.now()}`
  
  // Guardar preferenceId en el pedido
  if (pedidoId) {
    await db.collection('pedidos').doc(pedidoId).update({
      preferenceId: preferenceId,
      estado: 'pendiente',
      total,
      cliente,
      items,
      creadoEn: admin.firestore.FieldValue.serverTimestamp()
    })
  }

  return {
    preferenceId,
    initPoint: `https://www.mercadopago.com.co/checkout/v1/payment?pref=${preferenceId}`
  }
})

/**
 * Obtener estado de un pedido
 */
export const getPaymentStatus = functions.https.onCall(async (data, context) => {
  const { pedidoId } = data

  if (!pedidoId) {
    throw new functions.https.HttpsError('invalid-argument', 'Falta pedidoId')
  }

  const pedidoDoc = await db.collection('pedidos').doc(pedidoId).get()

  if (!pedidoDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Pedido no encontrado')
  }

  return pedidoDoc.data()
})

/**
 * Procesar pago (alternativo)
 */
export const processPayment = functions.https.onCall(async (data, context) => {
  const { pedidoId, paymentMethodId } = data

  // Aquí iría la lógica de procesamiento de pago
  // Por ahora retornamos éxito
  return {
    success: true,
    status: 'pending',
    pedidoId
  }
})

export default {
  mercadopagoWebhook,
  createPaymentPreference,
  getPaymentStatus,
  processPayment
}
