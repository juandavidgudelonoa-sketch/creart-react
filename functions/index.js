const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Access Token de MercadoPago (TEST)
const MP_ACCESS_TOKEN = 'TEST-5075764392468756-021923-751af8142d04bde1f80f6fcf20f896ee-714802328';

// Obtener token de MercadoPago
const getMpAccessToken = () => {
  return MP_ACCESS_TOKEN;
};

// Inicializar Firestore
const db = admin.firestore();

// ============================================================
// 3. CHECKOUT API - Crear Preferencia de Pago
// ============================================================
exports.createPaymentPreference = functions.https.onCall(async (data, context) => {
  // Firebase callable puede recibir datos en diferentes formatos
  // Intentar obtener los datos correctamente
  let requestData = data;
  
  // Si viene envuelto en 'data' (formato SDK)
  if (data && typeof data === 'object' && 'data' in data) {
    requestData = data.data;
  }
  
  // Si viene en formato raw (curl direct)
  if (typeof data === 'string') {
    try {
      requestData = JSON.parse(data);
    } catch (e) {
      requestData = {};
    }
  }
  
  console.log('RequestData:', JSON.stringify(requestData));
  
  const items = requestData?.items || [];
  const customer = requestData?.customer || {};
  const orderId = requestData?.orderId || `ORD-${Date.now()}`;
  
  console.log('Items:', JSON.stringify(items));
  console.log('Customer:', JSON.stringify(customer));
  console.log('OrderId:', orderId);

  if (!items || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'No items provided');
  }
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new functions.https.HttpsError('invalid-argument', 'No items provided');
  }

  // Mapear items al formato de MercadoPago
  const mappedItems = items.map(item => ({
    id: String(item.id || item.productId || 'item'),
    title: String(item.name || item.title || 'Producto'),
    quantity: parseInt(item.quantity) || 1,
    unit_price: parseFloat(item.price) || 0,
    currency_id: 'COP'
  }));

  // Calcular total
  const total = mappedItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  const preferenceData = {
    items: mappedItems,
    payer: {
      name: String(customer?.name || 'Cliente'),
      email: String(customer?.email || 'cliente@correo.com'),
      phone: {
        area_code: '57',
        number: String(customer?.phone || '3000000000')
      }
    },
    payment_methods: {
      excluded_payment_methods: [],
      excluded_payment_types: [],
      installments: 12
    },
    external_reference: String(orderId || `ORD-${Date.now()}`),
    notification_url: 'https://mercadopagowebhook-q4nwwuwuoq-uc.a.run.app/mercadopagoWebhook',
    back_urls: {
      success: 'https://creart-313b9.web.app/success',
      failure: 'https://creart-313b9.web.app/cart?error=payment_failed',
      pending: 'https://creart-313b9.web.app/success?status=pending'
    },
    auto_return: 'approved',
    binary_mode: true
  };

  try {
    console.log('Enviando preferencia a MercadoPago...');
    
    // Usar fetch directamente
    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getMpAccessToken()}`
      },
      body: JSON.stringify(preferenceData)
    });
    
    const responseData = await mpResponse.json();
    
    console.log('Respuesta preferencia:', JSON.stringify(responseData));
    
    if (!mpResponse.ok) {
      throw new Error(responseData.message || 'Error creating preference');
    }
    
    // Guardar orden en Firestore como pending
    await db.collection('orders').doc(orderId).set({
      orderId: orderId,
      items: mappedItems,
      customer: {
        name: customer?.name || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        address: customer?.address || '',
        cedula: customer?.cedula || '',
        notes: customer?.notes || ''
      },
      total: total,
      status: 'pending',
      paymentStatus: 'pending',
      preferenceId: responseData.id,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      preferenceId: responseData.id,
      initPoint: responseData.sandbox_init_point || responseData.init_point,
      status: 'pending'
    };
  } catch (error) {
    console.error('Error creating preference:', error.message);
    throw new functions.https.HttpsError('internal', 'Error creating payment preference: ' + error.message);
  }
});

// ============================================================
// 4. API PAGOS - Pago Directo con Tarjeta (Checkout API)
// ============================================================
exports.processPayment = functions.https.onCall(async (data, context) => {
  // Firebase callable puede recibir datos en diferentes formatos
  let requestData = data;
  
  // Si viene envuelto en 'data' (formato SDK de Firebase)
  if (data && typeof data === 'object' && 'data' in data) {
    requestData = data.data;
  }
  
  // Si viene doblemente envuelto (data.data)
  if (requestData && typeof requestData === 'object' && 'data' in requestData) {
    requestData = requestData.data;
  }
  
  console.log('Data recibida processPayment:', JSON.stringify(requestData));
  
  // Extraer datos de tarjeta o token
  const { token, cardData, transactionAmount, description, payer, externalReference, items, customer, installments, issuer_id } = requestData;
  
  // SI HAY DATOS DE TARJETA, CREAR TOKEN EN BACKEND
  let cardToken = token;
  let paymentMethodId = null;
  
  if (cardData && !token) {
    console.log('Creando token en backend con Access Token...');
    
    // Convertir año de 2 dígitos a 4 dígitos (30 -> 2030)
    let expYear = parseInt(cardData.expirationYear);
    if (expYear < 100) {
      expYear = 2000 + expYear;
    }
    
    console.log('Expiration:', { month: cardData.expirationMonth, year: expYear });
    
    // Crear token usando la API de MercadoPago
    const tokenResponse = await fetch('https://api.mercadopago.com/v1/card_tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getMpAccessToken()}`
      },
      body: JSON.stringify({
        card_number: cardData.cardNumber,
        cardholder_name: cardData.cardholderName,
        identification_type: cardData.identificationType || 'CC',
        identification_number: cardData.identificationNumber,
        security_code: cardData.securityCode,
        expiration_month: parseInt(cardData.expirationMonth),
        expiration_year: expYear
      })
    });
    
    const tokenResult = await tokenResponse.json();
    console.log('Token creado en backend:', JSON.stringify(tokenResult));
    
    if (!tokenResponse.ok || tokenResult.error) {
      throw new Error(tokenResult.message || 'Error al crear token de tarjeta');
    }
    
    cardToken = tokenResult.id;
    
    // Obtener payment_method_id del token o del BIN
    paymentMethodId = tokenResult.payment_method_id;
    
    // Si no viene en el token, obtenerlo del BIN
    if (!paymentMethodId && tokenResult.first_six_digits) {
      const bin = tokenResult.first_six_digits;
      console.log('Obteniendo payment method desde BIN:', bin);
      
      try {
        const pmResponse = await fetch(`https://api.mercadopago.com/v1/payment_methods?bin=${bin}&public_key=${getMpAccessToken()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${getMpAccessToken()}`
          }
        });
        
        const pmData = await pmResponse.json();
        console.log('Payment methods response:', JSON.stringify(pmData));
        
        if (pmData && pmData.length > 0) {
          paymentMethodId = pmData[0].id;
        }
      } catch (pmError) {
        console.error('Error obteniendo payment methods:', pmError);
        
        // Fallback: inferir del BIN
        if (bin.startsWith('4')) {
          paymentMethodId = 'visa';
        } else if (bin.startsWith('5')) {
          paymentMethodId = 'mastercard';
        } else if (bin.startsWith('3')) {
          paymentMethodId = 'amex';
        }
      }
    }
    
    console.log('Token ID:', cardToken, 'Payment Method:', paymentMethodId);
  }
  
  console.log('Token a usar:', cardToken);
  console.log('Monto:', transactionAmount);
  
  // Validar datos requeridos
  if (!cardToken) {
    console.error('Token no encontrado. Datos recibidos:', JSON.stringify(requestData));
    throw new functions.https.HttpsError('invalid-argument', 'Token de tarjeta es requerido');
  }

  if (!transactionAmount || parseFloat(transactionAmount) <= 0) {
    throw new functions.https.HttpsError('invalid-argument', 'Monto de transacción inválido');
  }

  const orderId = externalReference || `ORD-${Date.now()}`;

  console.log('Procesando pago:', { transactionAmount, orderId, cardToken });

  // Mapear items
  const mappedItems = items ? items.map((item) => ({
    id: String(item.id || item.productId || 'item'),
    title: String(item.name || item.title || 'Producto'),
    quantity: parseInt(item.quantity) || 1,
    unit_price: parseFloat(item.price) || 0,
    currency_id: 'COP'
  })) : [];

  // Guardar orden en Firestore
  await db.collection('orders').doc(orderId).set({
    orderId: orderId,
    items: mappedItems,
    customer: {
      name: customer?.name || payer?.first_name || '',
      email: customer?.email || payer?.email || '',
      phone: customer?.phone || '',
      address: customer?.address || '',
      cedula: customer?.cedula || payer?.identification?.number || '',
      notes: customer?.notes || ''
    },
    total: parseFloat(transactionAmount),
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  // Construir datos del pago para MercadoPago Payments API
  // Basado en documentación oficial de Core Methods
  const paymentData = {
    transaction_amount: parseFloat(transactionAmount),
    token: String(cardToken),
    payment_method_id: String(paymentMethodId || 'visa'),
    description: String(description || 'Compra en CREART'),
    external_reference: orderId,
    installments: parseInt(installments) || 1,
    issuer_id: issuer_id ? parseInt(issuer_id) : undefined,
    payer: {
      email: String(payer?.email || 'cliente@test.com'),
      first_name: String(payer?.first_name || 'Cliente'),
      last_name: String(payer?.last_name || 'Apellido'),
      identification: {
        type: String(payer?.identification?.type || 'CC'),
        number: String(payer?.identification?.number || '00000000')
      }
    },
    additional_info: {
      items: mappedItems.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    },
    binary_mode: false  // Cambiado a false para permitir validación
  };
  
  // Filtrar campos undefined
  Object.keys(paymentData).forEach(key => {
    if (paymentData[key] === undefined) {
      delete paymentData[key];
    }
  });

  console.log('Payment data:', JSON.stringify(paymentData));

  try {
    // Usar fetch para llamar a Payments API
    const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getMpAccessToken()}`,
        'X-Idempotency-Key': orderId
      },
      body: JSON.stringify(paymentData)
    });
    
    const result = await mpResponse.json();
    
    console.log('Respuesta pago:', JSON.stringify(result));
    console.log('Status respuesta:', mpResponse.status);
    
    if (!mpResponse.ok) {
      // Manejar errores específicos de MercadoPago
      const errorMsg = result.message || result.error || 'Payment failed';
      throw new Error(errorMsg);
    }

    // Actualizar orden según el resultado
    const newStatus = result.status === 'approved' ? 'paid' : 
                      result.status === 'pending' ? 'pending' : 'rejected';
    
    await db.collection('orders').doc(orderId).update({
      paymentStatus: result.status,
      status: newStatus,
      paymentId: result.id,
      statusDetail: result.status_detail,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      ...(result.status === 'approved' && { paidAt: admin.firestore.FieldValue.serverTimestamp() })
    });

    return {
      status: result.status,
      statusDetail: result.status_detail,
      paymentId: result.id,
      orderId: orderId
    };
  } catch (error) {
    console.error('Error processing payment:', error.message);
    
    // Actualizar orden con error
    try {
      await db.collection('orders').doc(orderId).update({
        paymentStatus: 'error',
        status: 'error',
        error: error.message,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Error updating order:', e);
    }
    
    return {
      status: 'rejected',
      statusDetail: 'error',
      message: error.message,
      paymentId: null
    };
  }
});

// ============================================================
// 5. WEBHOOKS - Notificaciones de MercadoPago
// ============================================================
exports.mercadopagoWebhook = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  const payment = req.body;
  console.log('Webhook recibido:', JSON.stringify(payment));

  if (payment && payment.type === 'payment') {
    const paymentId = payment.data.id;

    try {
      // Usar fetch directamente
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getMpAccessToken()}`
        }
      });
      
      const paymentInfo = await mpResponse.json();
      
      console.log('Info pago webhook:', JSON.stringify(paymentInfo));
      
      const orderId = paymentInfo.external_reference;
      
      if (orderId) {
        const newStatus = paymentInfo.status === 'approved' ? 'paid' : 
                         paymentInfo.status === 'pending' ? 'pending' : 'rejected';
        
        // Extraer datos del payer
        const payerInfo = paymentInfo.payer || {};
        const additionalInfo = paymentInfo.additional_info || {};
        
        // Actualizar la orden con los datos del pago
        await db.collection('orders').doc(orderId).update({
          paymentStatus: paymentInfo.status,
          status: newStatus,
          paymentId: paymentId,
          statusDetail: paymentInfo.status_detail,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          ...(paymentInfo.status === 'approved' && { paidAt: admin.firestore.FieldValue.serverTimestamp() }),
          // Guardar datos del card (NO sobrescribir datos del cliente del formulario)
          card: paymentInfo.card ? {
            lastFourDigits: paymentInfo.card.last_four_digits,
            cardBrand: paymentInfo.card.first_six_digits ? paymentInfo.card.first_six_digits.substring(0, 4) : '',
            paymentMethodId: paymentInfo.payment_method_id
          } : null
        });
        
        console.log(`Order ${orderId} updated to ${paymentInfo.status} with customer info`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  res.status(200).send('OK');
});

// ============================================================
// 6. CONSULTAR ESTADO DE PAGO
// ============================================================
exports.getPaymentStatus = functions.https.onCall(async (data, context) => {
  const { orderId } = data;
  
  if (!orderId) {
    throw new functions.https.HttpsError('invalid-argument', 'orderId is required');
  }
  
  const orderDoc = await db.collection('orders').doc(orderId).get();
  
  if (!orderDoc.exists) {
    return { status: 'not_found' };
  }
  
  return orderDoc.data();
});
