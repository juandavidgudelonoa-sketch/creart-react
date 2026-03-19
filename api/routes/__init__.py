"""
Rutas de la API
"""
from flask import Blueprint, request, jsonify
from datetime import datetime
from services.ai_service import ai_service
from services.firebase_service import firebase_service


# Blueprint principal
api_bp = Blueprint('api', __name__, url_prefix='/api')


# ============ HEALTH & INFO ============

@api_bp.route('/health', methods=['GET'])
def health():
    """Verificar estado de la API"""
    from config import Config
    
    return jsonify({
        "status": "ok",
        "message": f"{Config.APP_NAME} funcionando",
        "version": Config.VERSION,
        "firebase_connected": firebase_service.is_connected(),
        "ai_provider": "Ollama Cloud" if Config.OLLAMA_API_KEY else "Fallback"
    })


# ============ CHAT IA ============

@api_bp.route('/chat', methods=['POST'])
def chat():
    """Chat con IA"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({"error": "Falta el campo 'message'"}), 400
        
        user_message = data['message']
        
        # Obtener contexto de Firebase si está conectado
        context = {}
        if firebase_service.is_connected():
            orders = firebase_service.get_orders(limit=50)
            products = firebase_service.get_products(limit=50)
            context = {
                'orders': orders,
                'products': products,
                'summary': firebase_service.get_orders_summary()
            }
        
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


# ============ PEDIDOS ============

@api_bp.route('/orders', methods=['GET'])
def get_orders():
    """Obtener todos los pedidos"""
    try:
        limit = request.args.get('limit', 100, type=int)
        status = request.args.get('status')
        
        orders = firebase_service.get_orders(limit=limit)
        
        # Filtrar por status si se especifica
        if status:
            orders = [o for o in orders if o.get('status') == status]
        
        return jsonify({
            "success": True,
            "data": orders,
            "total": len(orders)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.route('/orders/<order_id>', methods=['GET'])
def get_order(order_id):
    """Obtener un pedido específico"""
    try:
        order = firebase_service.get_order(order_id)
        
        if not order:
            return jsonify({"success": False, "error": "Pedido no encontrado"}), 404
        
        return jsonify({
            "success": True,
            "data": order
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.route('/orders/<order_id>/status', methods=['PUT'])
def update_order_status(order_id):
    """Actualizar estado de un pedido"""
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({"success": False, "error": "Falta el estado"}), 400
        
        valid_statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled']
        if new_status not in valid_statuses:
            return jsonify({"success": False, "error": f"Estado inválido. Usar: {valid_statuses}"}), 400
        
        success = firebase_service.update_order_status(order_id, new_status)
        
        if success:
            return jsonify({
                "success": True,
                "message": f"Estado actualizado a '{new_status}'"
            })
        else:
            return jsonify({"success": False, "error": "Error al actualizar"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============ PRODUCTOS ============

@api_bp.route('/products', methods=['GET'])
def get_products():
    """Obtener todos los productos"""
    try:
        limit = request.args.get('limit', 100, type=int)
        category = request.args.get('category')
        
        products = firebase_service.get_products(limit=limit)
        
        # Filtrar por categoría si se especifica
        if category:
            products = [p for p in products if p.get('category') == category]
        
        return jsonify({
            "success": True,
            "data": products,
            "total": len(products)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.route('/products/<product_id>', methods=['GET'])
def get_product(product_id):
    """Obtener un producto específico"""
    try:
        product = firebase_service.get_product(product_id)
        
        if not product:
            return jsonify({"success": False, "error": "Producto no encontrado"}), 404
        
        return jsonify({
            "success": True,
            "data": product
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.route('/products/low-stock', methods=['GET'])
def get_low_stock():
    """Obtener productos con stock bajo"""
    try:
        threshold = request.args.get('threshold', 5, type=int)
        products = firebase_service.get_low_stock_products(threshold)
        
        return jsonify({
            "success": True,
            "data": products,
            "total": len(products)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.route('/products/<product_id>/stock', methods=['PUT'])
def update_product_stock(product_id):
    """Actualizar stock de un producto"""
    try:
        data = request.get_json()
        stock = data.get('stock')
        
        if stock is None:
            return jsonify({"success": False, "error": "Falta el stock"}), 400
        
        success = firebase_service.update_product_stock(product_id, stock)
        
        if success:
            return jsonify({
                "success": True,
                "message": f"Stock actualizado a {stock}"
            })
        else:
            return jsonify({"success": False, "error": "Error al actualizar"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============ ANÁLISIS Y RESUMEN ============

@api_bp.route('/summary', methods=['GET'])
def summary():
    """Resumen de ventas (datos reales)"""
    try:
        if not firebase_service.is_connected():
            return jsonify({
                "success": False,
                "error": "Firebase no conectado"
            }), 500
        
        data = firebase_service.get_orders_summary()
        
        # Obtener productos más vendidos
        orders = firebase_service.get_orders()
        product_sales = {}
        for order in orders:
            for item in order.get('items', []):
                name = item.get('name', 'Unknown')
                product_sales[name] = product_sales.get(name, 0) + item.get('quantity', 0)
        
        top_products = [
            {"name": name, "quantity": qty}
            for name, qty in sorted(product_sales.items(), key=lambda x: x[1], reverse=True)[:5]
        ]
        
        return jsonify({
            "success": True,
            "data": {
                **data,
                "topProducts": top_products,
                "period": datetime.now().strftime('%B %Y')
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.route('/analysis', methods=['GET'])
def analysis():
    """Análisis de clientes"""
    try:
        if not firebase_service.is_connected():
            return jsonify({
                "success": False,
                "error": "Firebase no conectado"
            }), 500
        
        customers = firebase_service.get_customers()
        
        total = len(customers)
        repeat = sum(1 for c in customers if c.get('ordersCount', 0) > 1)
        
        avg_order_value = sum(c.get('totalSpent', 0) for c in customers) / total if total > 0 else 0
        retention = (repeat / total * 100) if total > 0 else 0
        
        return jsonify({
            "success": True,
            "data": {
                "totalCustomers": total,
                "newCustomers": total - repeat,
                "repeatCustomers": repeat,
                "averageOrderValue": avg_order_value,
                "retentionRate": round(retention, 1)
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.route('/recommendations', methods=['GET'])
def recommendations():
    """Recomendaciones de stock"""
    try:
        if not firebase_service.is_connected():
            return jsonify({
                "success": False,
                "error": "Firebase no conectado"
            }), 500
        
        low_stock = firebase_service.get_low_stock_products(threshold=5)
        
        recommendations = []
        for product in low_stock:
            current = product.get('stock', 0)
            recommendations.append({
                "product": product.get('name', 'Unknown'),
                "currentStock": current,
                "recommendedStock": 20 if current == 0 else 15,
                "reason": "Sin stock" if current == 0 else "Stock crítico",
                "urgency": "high" if current == 0 else "medium"
            })
        
        return jsonify({
            "success": True,
            "data": recommendations
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@api_bp.route('/prediction', methods=['GET'])
def prediction():
    """Predicción de ventas (básico)"""
    try:
        if not firebase_service.is_connected():
            return jsonify({
                "success": False,
                "error": "Firebase no conectado"
            }), 500
        
        summary = firebase_service.get_orders_summary()
        
        # Predicción simple basada en datos históricos
        avg_daily = summary.get('todayOrders', 0)
        predicted_orders = avg_daily * 7
        
        return jsonify({
            "success": True,
            "data": {
                "period": "Próximos 7 días",
                "predictedOrders": predicted_orders,
                "predictedRevenue": predicted_orders * 850000,
                "confidence": 0.7,
                "factors": ["Tendencia histórica", "Promedio móvil"],
                "recommendation": "Considera aumentar stock de productos populares"
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
