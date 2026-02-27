# API Flask para CREART - Con IA
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import random

app = Flask(__name__)
CORS(app)

# ============= HELPERS =============

def get_orders_from_firebase():
    """Obtener pedidos de Firebase - simulados por ahora"""
    # En producción, esto se conectaría a Firebase
    return []

def get_products_from_firebase():
    """Obtener productos de Firebase - simulados por ahora"""
    return []

# ============= HEALTH =============

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "message": "CREART API funcionando con IA",
        "version": "2.0.0"
    })

# ============= CHAT CON IA =============

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({"error": "Falta el campo 'message'"}), 400
        
        user_message = data['message'].lower()
        context = data.get('context', {})
        
        # Obtener datos del contexto
        orders = context.get('orders', [])
        products = context.get('products', [])
        
        # Lógica de respuestas con IA (simulado - conectar con Ollama después)
        response = generate_ai_response(user_message, orders, products)
        
        return jsonify({
            "success": True,
            "reply": response
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def generate_ai_response(message, orders, products):
    """Generar respuesta de IA - aquí se puede integrar Ollama"""
    
    # Respuestas predefinidas que se pueden mejorar con Ollama
    if 'pedido' in message and ('pendiente' in message or 'cuantos' in message):
        pending = len([o for o in orders if o.get('status') == 'pending']) if orders else 0
        return f"Tienes {pending} pedidos pendientes en este momento."
    
    if 'venta' in message and ('hoy' in message or 'día' in message):
        today = datetime.now().strftime('%Y-%m-%d')
        today_orders = [o for o in orders if o.get('date') == today] if orders else []
        total = sum(o.get('total', 0) for o in today_orders)
        return f"Hoy tienes {len(today_orders)} pedidos con ingresos de ${total:,.0f} COP."
    
    if 'producto' in message and ('mas' in message or 'vendido' in message):
        return "Los productos más vendidos son: Sillas clásicas, Mesas de comedor, y Aparadores modulares."
    
    if 'cliente' in message and ('nuevo' in message or 'nuevos' in message):
        return "Tienes 15 clientes nuevos esta semana. El 60% son compras recurrentes."
    
    if 'stock' in message or 'inventario' in message:
        return "3 productos tienen stock bajo: Silla Eames (2 unidades), Mesa centro (1 unidad), Taburete alto (0 unidades)."
    
    if 'hola' in message or 'buenas' in message:
        return "¡Hola! Soy el asistente IA de CREART. Puedo ayudarte con información sobre pedidos, ventas, productos, clientes y más. ¿Qué necesitas saber?"
    
    # Respuesta genérica con IA
    return f"Entiendo tu pregunta: '{message}'. Tengo acceso a los datos de tu tienda. ¿Quieres que te ayude con algo específico como pedidos, ventas, productos o clientes?"

# ============= RESUMEN DE VENTAS =============

@app.route('/api/summary', methods=['POST'])
def sales_summary():
    try:
        data = request.get_json() or {}
        
        # Simular datos - en producción venir de Firebase
        orders = get_orders_from_firebase()
        
        # Calcular estadísticas
        total_orders = len(orders)
        total_revenue = sum(o.get('total', 0) for o in orders)
        pending_orders = len([o for o in orders if o.get('status') == 'pending'])
        completed_orders = len([o for o in orders if o.get('status') == 'completed'])
        
        # Productos más vendidos (simulado)
        top_products = [
            {"name": "Silla Clásica", "quantity": 45},
            {"name": "Mesa Comedor 6 puestos", "quantity": 23},
            {"name": "Aparador Modular", "quantity": 18},
            {"name": "Escritorio Moderno", "quantity": 15},
            {"name": "Taburete Alto", "quantity": 12},
        ]
        
        # Pedidos de hoy
        today = datetime.now().strftime('%Y-%m-%d')
        today_orders = len([o for o in orders if o.get('date') == today])
        
        # Ingresos del mes
        current_month = datetime.now().month
        monthly_revenue = sum(
            o.get('total', 0) for o in orders 
            if datetime.strptime(o.get('date', '2024-01-01'), '%Y-%m-%d').month == current_month
        )
        
        return jsonify({
            "success": True,
            "data": {
                "totalOrders": total_orders,
                "totalRevenue": total_revenue,
                "pendingOrders": pending_orders,
                "completedOrders": completed_orders,
                "topProducts": top_products,
                "todayOrders": today_orders,
                "monthlyRevenue": monthly_revenue,
                "period": datetime.now().strftime('%B %Y')
            }
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============= ANÁLISIS DE CLIENTES =============

@app.route('/api/analysis', methods=['POST'])
def customer_analysis():
    try:
        # Simular datos de clientes
        total_customers = 156
        new_customers = 23
        repeat_customers = total_customers - new_customers
        
        top_customers = [
            {"email": "cliente1@email.com", "orders": 12, "total": 4500000},
            {"email": "cliente2@email.com", "orders": 8, "total": 3200000},
            {"email": "cliente3@email.com", "orders": 6, "total": 2800000},
        ]
        
        average_order_value = 850000
        
        return jsonify({
            "success": True,
            "data": {
                "totalCustomers": total_customers,
                "newCustomers": new_customers,
                "repeatCustomers": repeat_customers,
                "topCustomers": top_customers,
                "averageOrderValue": average_order_value,
                "retentionRate": round((repeat_customers / total_customers) * 100, 1)
            }
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============= RECOMENDACIONES DE STOCK =============

@app.route('/api/recommendations', methods=['POST'])
def stock_recommendations():
    try:
        # Simular recomendaciones de stock
        recommendations = [
            {
                "product": "Silla Clásica",
                "currentStock": 2,
                "recommendedStock": 20,
                "reason": "Alta demanda - 45 ventas este mes",
                "urgency": "high"
            },
            {
                "product": "Mesa Centro",
                "currentStock": 1,
                "recommendedStock": 15,
                "reason": "Stock crítico - último unidad",
                "urgency": "high"
            },
            {
                "product": "Taburete Alto",
                "currentStock": 0,
                "recommendedStock": 25,
                "reason": "Sin stock - 12 solicitudes pendientes",
                "urgency": "high"
            },
            {
                "product": "Aparador 4 puertas",
                "currentStock": 3,
                "recommendedStock": 10,
                "reason": "Stock bajo - considerar reposición",
                "urgency": "medium"
            },
            {
                "product": "Escritorio Blanco",
                "currentStock": 8,
                "recommendedStock": 10,
                "reason": "Stock adecuado pero monitorizar",
                "urgency": "low"
            }
        ]
        
        return jsonify({
            "success": True,
            "data": recommendations
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============= PREDICCIÓN DE VENTAS =============

@app.route('/api/prediction', methods=['POST'])
def sales_prediction():
    try:
        data = request.get_json() or {}
        days = data.get('days', 7)
        
        # Simular predicción - en producción usar modelo IA
        base_orders = 15
        base_revenue = 12000000
        
        predicted_orders = base_orders + random.randint(-3, 8)
        predicted_revenue = base_revenue + random.randint(-2000000, 5000000)
        
        return jsonify({
            "success": True,
            "data": {
                "period": f"Próximos {days} días",
                "predictedOrders": predicted_orders,
                "predictedRevenue": predicted_revenue,
                "confidence": 0.75,
                "factors": [
                    "Tendencia histórica de ventas",
                    "Estacionalidad del mes",
                    "Patrón de días festivos",
                    "Promedio móvil de 30 días"
                ],
                "recommendation": "Considera aumentar stock de sillas y mesas para los próximos días"
            }
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============= PROCESAR TAREA =============

@app.route('/api/process', methods=['POST'])
def process_prompt():
    try:
        data = request.get_json()
        
        if not data or 'task' not in data:
            return jsonify({"error": "Falta el campo 'task'"}), 400
        
        task = data['task']
        task_type = data.get('type', 'general')
        
        # Procesar según el tipo
        if task_type == 'sales':
            result = {"type": "sales_summary", "message": "Generando resumen de ventas..."}
        elif task_type == 'customers':
            result = {"type": "customer_analysis", "message": "Analizando clientes..."}
        elif task_type == 'products':
            result = {"type": "product_analysis", "message": "Analizando productos..."}
        else:
            result = {"type": "general", "message": f"Tarea '{task}' procesada"}
        
        return jsonify({
            "success": True,
            "data": result
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============= MAIN =============

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    
    print("Iniciando CREART API con IA...")
    print(f"Endpoint: http://localhost:{port}")
    print("Endpoints disponibles:")
    print("   GET  /api/health           - Verificar estado")
    print("   POST /api/chat            - Chat con IA")
    print("   POST /api/summary         - Resumen de ventas")
    print("   POST /api/analysis        - Análisis de clientes")
    print("   POST /api/recommendations - Recomendaciones de stock")
    print("   POST /api/prediction      - Predicción de ventas")
    print()
    
    app.run(host='0.0.0.0', port=port, debug=False)
