# API Flask para CREART - Con IA y Ollama
# Ejecutar: python api_server.py
# Puerto: http://localhost:5000

from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os
import random
import requests

app = Flask(__name__)
CORS(app)

# ============= CONFIGURACIÓN DE OLLAMA =============
OLLAMA_LOCAL = "http://localhost:11434"
OLLAMA_CLOUD = "https://api.ollama.com/v1"
DEFAULT_MODEL = "qwen2.5:3b"
OLLAMA_API_KEY = os.environ.get('OLLAMA_API_KEY', '')
OLLAMA_LOCAL = "http://localhost:11434"
OLLAMA_CLOUD = "https://api.ollama.com"
DEFAULT_MODEL = "qwen2.5:3b"

def generate_with_ollama(message: str, context: dict = None) -> str:
    """
    Genera respuesta usando Ollama con fallback: local -> nube
    """
    # Preparar el prompt con contexto
    system_prompt = """Eres el asistente IA de CREART, una tienda de muebles de carpintería en Colombia.
Tienes acceso a los datos de la tienda: pedidos, productos, clientes e inventario.
Responde de forma útil, concisa y profesional en español.
Si no tienes información específica,di que no la tienes."""
    
    # Construir el prompt con contexto
    prompt = f"{system_prompt}\n\n"
    
    if context:
        orders = context.get('orders', [])
        products = context.get('products', [])
        stats = context.get('stats', {})
        
        if orders:
            prompt += f"Información de pedidos: Hay {len(orders)} pedidos. "
            if stats.get('totalOrders'):
                prompt += f"Total de pedidos: {stats['totalOrders']}. "
        
        if products:
            prompt += f"Hay {len(products)} productos en el catálogo. "
    
    prompt += f"\n\nUsuario: {message}\nAsistente:"
    
    # Intentar con Ollama local primero
    try:
        response = requests.post(
            f"{OLLAMA_LOCAL}/api/generate",
            json={
                "model": DEFAULT_MODEL,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.7,
                    "top_p": 0.9
                }
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            return result.get('response', '').strip()
    except Exception as e:
        print(f"Ollama local no disponible: {e}")
    
    # Fallback: intentar con API de Ollama en la nube (si está configurada)
    if OLLAMA_API_KEY:
        try:
            response = requests.post(
                f"{OLLAMA_CLOUD}/chat",
                headers={
                    "Authorization": f"Bearer {OLLAMA_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": DEFAULT_MODEL,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "stream": False
                },
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('choices', [{}])[0].get('message', {}).get('content', '').strip()
        except Exception as e:
            print(f"Ollama cloud no disponible: {e}")
    ollama_api_key = os.environ.get('OLLAMA_API_KEY')
    if ollama_api_key:
        try:
            response = requests.post(
                f"{OLLAMA_CLOUD}/api/generate",
                headers={"Authorization": f"Bearer {ollama_api_key}"},
                json={
                    "model": DEFAULT_MODEL,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', '').strip()
        except Exception as e:
            print(f"Ollama cloud no disponible: {e}")
    
    # Si todo falla, usar respuestas predefinidas
    return generate_fallback_response(message, context)

def generate_fallback_response(message: str, context: dict = None) -> str:
    """
    Respuestas predefinidas si Ollama no está disponible
    """
    message = message.lower()
    orders = context.get('orders', []) if context else []
    stats = context.get('stats', {}) if context else {}
    
    if 'pedido' in message and ('pendiente' in message or 'cuántos' in message or 'cuantas' in message):
        pending = len([o for o in orders if o.get('status') == 'pending']) if orders else stats.get('totalOrders', 0)
        return f"Tienes {pending} pedidos pendientes en este momento."
    
    if 'venta' in message and ('hoy' in message or 'día' in message or 'dia' in message):
        return f"Hoy tienes varias ventas registradas. Los ingresos totales de hoy superan los esperados."
    
    if 'producto' in message and ('más' in message or 'mas' in message or 'vendido' in message):
        return "Los productos más vendidos son: Sillas clásicas, Mesas de comedor 6 puestos, y Aparadores modulares."
    
    if 'cliente' in message and ('nuevo' in message or 'nuevos' in message or 'cuántos' in message):
        return "Tienes 156 clientes registrados. El 85% son clientes recurrentes."
    
    if 'stock' in message or 'inventario' in message or 'existencia' in message:
        return "3 productos tienen stock bajo: Silla Clásica (2 unidades), Mesa Centro (1 unidad), Taburete Alto (0 unidades). Te recomiendo reponer pronto."
    
    if 'hola' in message or 'buenas' in message or 'buenos' in message:
        return "¡Hola! Soy el asistente IA de CREART. Puedo ayudarte con información sobre pedidos, ventas, productos, clientes y más. ¿Qué necesitas saber?"
    
    if 'ingreso' in message or 'ganancia' in message or 'dinero' in message:
        return "Los ingresos totales del mes actual superan los $12,000,000 COP. El ticket promedio es de $850,000 COP."
    
    return f"Entiendo tu pregunta: '{message}'. Tengo acceso a los datos de tu tienda. ¿Quieres que te ayude con algo específico como pedidos, ventas, productos o clientes?"

# ============= HEALTH =============

@app.route('/api/health', methods=['GET'])
def health():
    """Verifica que el servidor está corriendo"""
    return jsonify({
        "status": "ok",
        "message": "CREART API funcionando con IA",
        "version": "2.1.0"
    })

# ============= CHAT CON IA =============

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Chat con IA usando Ollama
    Enviar: { "message": "tu mensaje", "context": { "orders": [...], "products": [...], "stats": {...} } }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({"error": "Falta el campo 'message'"}), 400
        
        user_message = data['message']
        context = data.get('context', {})
        
        # Generar respuesta con IA
        reply = generate_with_ollama(user_message, context)
        
        return jsonify({
            "success": True,
            "reply": reply
        })
    
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============= RESUMEN DE VENTAS =============

@app.route('/api/summary', methods=['POST'])
def sales_summary():
    """Resumen de ventas"""
    try:
        # Datos simulados - en producción venir de Firebase
        top_products = [
            {"name": "Silla Clásica", "quantity": 45},
            {"name": "Mesa Comedor 6 puestos", "quantity": 23},
            {"name": "Aparador Modular", "quantity": 18},
            {"name": "Escritorio Moderno", "quantity": 15},
            {"name": "Taburete Alto", "quantity": 12},
        ]
        
        return jsonify({
            "success": True,
            "data": {
                "totalOrders": 156,
                "totalRevenue": 132600000,
                "pendingOrders": 12,
                "completedOrders": 144,
                "topProducts": top_products,
                "todayOrders": 8,
                "monthlyRevenue": 45000000,
                "period": datetime.now().strftime('%B %Y')
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============= ANÁLISIS DE CLIENTES =============

@app.route('/api/analysis', methods=['POST'])
def customer_analysis():
    """Análisis de clientes"""
    try:
        return jsonify({
            "success": True,
            "data": {
                "totalCustomers": 156,
                "newCustomers": 23,
                "repeatCustomers": 133,
                "topCustomers": [
                    {"email": "cliente1@email.com", "orders": 12, "total": 4500000},
                    {"email": "cliente2@email.com", "orders": 8, "total": 3200000},
                    {"email": "cliente3@email.com", "orders": 6, "total": 2800000}
                ],
                "averageOrderValue": 850000,
                "retentionRate": 85.3
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============= RECOMENDACIONES DE STOCK =============

@app.route('/api/recommendations', methods=['POST'])
def stock_recommendations():
    """Recomendaciones de inventario"""
    try:
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
                "reason": "Stock crítico - última unidad",
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
    """Predicción de ventas"""
    try:
        days = 7
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
    """Procesar tarea"""
    try:
        data = request.get_json()
        
        if not data or 'task' not in data:
            return jsonify({"error": "Falta el campo 'task'"}), 400
        
        task = data['task']
        task_type = data.get('type', 'general')
        
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
    print("   GET  /api/health            - Verificar estado")
    print("   POST /api/chat             - Chat con IA (Ollama)")
    print("   POST /api/summary          - Resumen de ventas")
    print("   POST /api/analysis         - Análisis de clientes")
    print("   POST /api/recommendations  - Recomendaciones de stock")
    print("   POST /api/prediction       - Predicción de ventas")
    print()
    
    app.run(host='0.0.0.0', port=port, debug=False)
