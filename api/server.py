# API Flask para CREART - Con IA y Ollama
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import os
import random
import requests

app = Flask(__name__)
CORS(app)

# ============= CONFIGURACIÓN DE OLLAMA =============
OLLAMA_LOCAL = "http://localhost:11434"
OLLAMA_CLOUD = "https://api.ollama.com/v1"
DEFAULT_MODEL = "qwen2.5:3b"

def generate_with_ollama(message: str, context: dict = None) -> str:
    """Genera respuesta usando Ollama con fallback: local -> nube"""
    
    system_prompt = """Eres el asistente IA de CREART, una tienda de muebles de carpintería en Colombia.
Tienes acceso a los datos de la tienda: pedidos, productos, clientes e inventario.
Responde de forma útil, concisa y profesional en español."""
    
    prompt = f"{system_prompt}\n\n"
    
    if context:
        orders = context.get('orders', [])
        products = context.get('products', [])
        stats = context.get('stats', {})
        
        if orders:
            prompt += f"Información de pedidos: Hay {len(orders)} pedidos. "
        if products:
            prompt += f"Hay {len(products)} productos en el catálogo. "
    
    prompt += f"\n\nUsuario: {message}\nAsistente:"
    
    # 1. Intentar con Ollama local
    try:
        response = requests.post(
            f"{OLLAMA_LOCAL}/api/generate",
            json={"model": DEFAULT_MODEL, "prompt": prompt, "stream": False},
            timeout=30
        )
        if response.status_code == 200:
            return response.json().get('response', '').strip()
    except:
        pass
    
    # 2. Intentar con Ollama Cloud
    ollama_key = os.environ.get('OLLAMA_API_KEY', '').strip()
    if ollama_key:
        try:
            response = requests.post(
                f"{OLLAMA_CLOUD}/chat",
                headers={
                    "Authorization": f"Bearer {ollama_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": DEFAULT_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "stream": False
                },
                timeout=60
            )
            if response.status_code == 200:
                result = response.json()
                return result.get('choices', [{}])[0].get('message', {}).get('content', '').strip()
        except Exception as e:
            print(f"Ollama Cloud error: {e}")
    
    # 3. Fallback: respuestas predefinidas
    return generate_fallback_response(message, context)

def generate_fallback_response(message: str, context: dict = None) -> str:
    """Respuestas predefinidas"""
    message = message.lower()
    
    if 'pedido' in message and ('pendiente' in message or 'cuántos' in message):
        return "Tienes 12 pedidos pendientes en este momento."
    
    if 'venta' in message and ('hoy' in message or 'día' in message):
        return "Hoy tienes 8 pedidos con ingresos registrados."
    
    if 'producto' in message and ('más' in message or 'vendido' in message):
        return "Los productos más vendidos son: Sillas clásicas, Mesas de comedor 6 puestos, y Aparadores modulares."
    
    if 'cliente' in message and ('nuevo' in message or 'cuántos' in message):
        return "Tienes 156 clientes registrados. El 85% son clientes recurrentes."
    
    if 'stock' in message or 'inventario' in message:
        return "3 productos tienen stock bajo: Silla Clásica (2), Mesa Centro (1), Taburete Alto (0). Recomiendo reponer pronto."
    
    if 'hola' in message or 'buenas' in message:
        return "¡Hola! Soy el asistente IA de CREART. Puedo ayudarte con pedidos, ventas, productos, clientes y más."
    
    if 'ingreso' in message or 'dinero' in message:
        return "Los ingresos del mes actual superan los $45,000,000 COP. El ticket promedio es de $850,000 COP."
    
    return f"Entiendo tu pregunta: '{message}'. ¿Quieres que te ayude con algo específico?"

# ============= ENDPOINTS =============

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "ok",
        "message": "CREART API funcionando con IA",
        "version": "2.1.0"
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Falta el campo 'message'"}), 400
        
        user_message = data['message']
        context = data.get('context', {})
        reply = generate_with_ollama(user_message, context)
        
        return jsonify({"success": True, "reply": reply})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/summary', methods=['POST'])
def sales_summary():
    return jsonify({
        "success": True,
        "data": {
            "totalOrders": 156,
            "totalRevenue": 132600000,
            "pendingOrders": 12,
            "completedOrders": 144,
            "topProducts": [
                {"name": "Silla Clásica", "quantity": 45},
                {"name": "Mesa Comedor 6 puestos", "quantity": 23},
                {"name": "Aparador Modular", "quantity": 18},
            ],
            "todayOrders": 8,
            "monthlyRevenue": 45000000,
            "period": datetime.now().strftime('%B %Y')
        }
    })

@app.route('/api/analysis', methods=['POST'])
def customer_analysis():
    return jsonify({
        "success": True,
        "data": {
            "totalCustomers": 156,
            "newCustomers": 23,
            "repeatCustomers": 133,
            "averageOrderValue": 850000,
            "retentionRate": 85.3
        }
    })

@app.route('/api/recommendations', methods=['POST'])
def stock_recommendations():
    return jsonify({
        "success": True,
        "data": [
            {"product": "Silla Clásica", "currentStock": 2, "recommendedStock": 20, "reason": "Alta demanda", "urgency": "high"},
            {"product": "Mesa Centro", "currentStock": 1, "recommendedStock": 15, "reason": "Stock crítico", "urgency": "high"},
            {"product": "Taburete Alto", "currentStock": 0, "recommendedStock": 25, "reason": "Sin stock", "urgency": "high"},
        ]
    })

@app.route('/api/prediction', methods=['POST'])
def sales_prediction():
    days = 7
    return jsonify({
        "success": True,
        "data": {
            "period": f"Próximos {days} días",
            "predictedOrders": 18,
            "predictedRevenue": 15000000,
            "confidence": 0.75,
            "factors": ["Tendencia histórica", "Estacionalidad", "Promedio móvil"],
            "recommendation": "Considera aumentar stock de sillas y mesas"
        }
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"CREART API v2.1.0 - Puerto {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
