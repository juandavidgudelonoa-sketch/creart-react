"""
Rutas de la API
"""
from flask import Blueprint, request, jsonify
from services.ai_service import ai_service

# Blueprint principal
api_bp = Blueprint('api', __name__, url_prefix='/api')


@api_bp.route('/health', methods=['GET'])
def health():
    """Verificar estado de la API"""
    from config import Config
    return jsonify({
        "status": "ok",
        "message": f"{Config.APP_NAME} funcionando con IA",
        "version": Config.VERSION,
        "ai_provider": "Ollama Cloud" if Config.OLLAMA_API_KEY else "Fallback"
    })


@api_bp.route('/chat', methods=['POST'])
def chat():
    """Chat con IA"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({"error": "Falta el campo 'message'"}), 400
        
        user_message = data['message']
        context = data.get('context', {})
        
        reply = ai_service.generate_response(user_message, context)
        
        return jsonify({
            "success": True,
            "reply": reply
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@api_bp.route('/summary', methods=['POST'])
def summary():
    """Resumen de ventas"""
    from datetime import datetime
    
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


@api_bp.route('/analysis', methods=['POST'])
def analysis():
    """Análisis de clientes"""
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


@api_bp.route('/recommendations', methods=['POST'])
def recommendations():
    """Recomendaciones de stock"""
    return jsonify({
        "success": True,
        "data": [
            {"product": "Silla Clásica", "currentStock": 2, "recommendedStock": 20, "reason": "Alta demanda", "urgency": "high"},
            {"product": "Mesa Centro", "currentStock": 1, "recommendedStock": 15, "reason": "Stock crítico", "urgency": "high"},
            {"product": "Taburete Alto", "currentStock": 0, "recommendedStock": 25, "reason": "Sin stock", "urgency": "high"},
        ]
    })


@api_bp.route('/prediction', methods=['POST'])
def prediction():
    """Predicción de ventas"""
    return jsonify({
        "success": True,
        "data": {
            "period": "Próximos 7 días",
            "predictedOrders": 18,
            "predictedRevenue": 15000000,
            "confidence": 0.75,
            "factors": ["Tendencia histórica", "Estacionalidad", "Promedio móvil"],
            "recommendation": "Considera aumentar stock de sillas y mesas"
        }
    })
