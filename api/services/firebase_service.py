"""
Servicio de Firebase para la API usando Firebase Admin SDK
"""
import os
from datetime import datetime
from typing import List, Dict, Optional
import json


class FirebaseService:
    """Servicio para conectar con Firebase/Firestore usando firebase-admin"""
    
    def __init__(self):
        self.db = None
        self._initialize()
    
    def _initialize(self):
        """Inicializar conexión a Firestore"""
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore
            
            # Verificar si ya está inicializado
            if not firebase_admin._apps:
                # Intentar obtener credenciales de variable de entorno
                credentials_json = os.environ.get('GOOGLE_APPLICATION_CREDENTIALS')
                
                if credentials_json:
                    # Usar el JSON de las variables de entorno
                    cred_dict = json.loads(credentials_json)
                    cred = credentials.Certificate(cred_dict)
                else:
                    # Usar credenciales por defecto (ADC)
                    cred = credentials.ApplicationDefault()
                
                firebase_admin.initialize_app(cred)
            
            self.db = firestore.client()
            print("Firebase Admin SDK connected successfully")
        except Exception as e:
            print(f"WARNING: Firebase connection failed: {str(e)[:100]}")
            self.db = None
    
    def is_connected(self) -> bool:
        """Verificar si hay conexión"""
        return self.db is not None
    
    # ============ PEDIDOS ============
    
    def get_orders(self, limit: int = 100) -> List[Dict]:
        """Obtener todos los pedidos"""
        if not self.is_connected():
            return self._get_demo_orders()
        
        try:
            orders_ref = self.db.collection('orders').limit(limit)
            docs = orders_ref.get()
            
            orders = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                orders.append(data)
            
            return orders
        except Exception as e:
            print(f"Error getting orders: {e}")
            return self._get_demo_orders()
    
    def _get_demo_orders(self) -> List[Dict]:
        """Datos de ejemplo para demos"""
        return [
            {
                "id": "ord_001",
                "date": "2026-02-28",
                "status": "pending",
                "customer": {"name": "Juan Perez", "email": "juan@email.com"},
                "total": 850000,
                "items": [{"name": "Silla Clásica", "quantity": 2, "price": 425000}]
            },
            {
                "id": "ord_002", 
                "date": "2026-02-27",
                "status": "completed",
                "customer": {"name": "Maria Garcia", "email": "maria@email.com"},
                "total": 1200000,
                "items": [{"name": "Mesa Comedor", "quantity": 1, "price": 1200000}]
            }
        ]
    
    def get_order(self, order_id: str) -> Optional[Dict]:
        """Obtener un pedido específico"""
        if not self.is_connected():
            orders = self._get_demo_orders()
            return next((o for o in orders if o['id'] == order_id), None)
        
        try:
            doc = self.db.collection('orders').document(order_id).get()
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            return None
        except Exception as e:
            print(f"Error getting order: {e}")
            return None
    
    def update_order_status(self, order_id: str, status: str) -> bool:
        """Actualizar estado de un pedido"""
        if not self.is_connected():
            print(f"Demo: Updated order {order_id} to status: {status}")
            return True
        
        try:
            self.db.collection('orders').document(order_id).update({
                'status': status
            })
            return True
        except Exception as e:
            print(f"Error updating order: {e}")
            return False
    
    def get_orders_summary(self) -> Dict:
        """Obtener resumen de pedidos"""
        orders = self.get_orders()
        
        if not orders:
            return {
                "totalOrders": 0,
                "totalRevenue": 0,
                "pendingOrders": 0,
                "completedOrders": 0,
                "todayOrders": 0,
                "monthlyRevenue": 0
            }
        
        total = len(orders)
        pending = sum(1 for o in orders if o.get('status') in ['pending', 'processing'])
        completed = sum(1 for o in orders if o.get('status') == 'completed')
        
        # Calcular ingresos
        total_revenue = sum(o.get('total', 0) for o in orders)
        
        # Pedidos de hoy
        today = datetime.now().strftime('%Y-%m-%d')
        today_orders = sum(1 for o in orders if str(o.get('date', '')).startswith(today))
        
        return {
            "totalOrders": total,
            "totalRevenue": total_revenue,
            "pendingOrders": pending,
            "completedOrders": completed,
            "todayOrders": today_orders,
            "monthlyRevenue": total_revenue
        }
    
    # ============ PRODUCTOS ============
    
    def get_products(self, limit: int = 100) -> List[Dict]:
        """Obtener todos los productos"""
        if not self.is_connected():
            return self._get_demo_products()
        
        try:
            products_ref = self.db.collection('products').limit(limit)
            docs = products_ref.get()
            
            products = []
            for doc in docs:
                data = doc.to_dict()
                data['id'] = doc.id
                products.append(data)
            
            return products
        except Exception as e:
            print(f"Error getting products: {e}")
            return self._get_demo_products()
    
    def _get_demo_products(self) -> List[Dict]:
        """Productos de ejemplo"""
        return [
            {"id": "prod_001", "name": "Silla Clásica", "category": "sillas", "price": 425000, "stock": 5},
            {"id": "prod_002", "name": "Mesa Comedor 6 puestos", "category": "mesas", "price": 1200000, "stock": 3},
            {"id": "prod_003", "name": "Aparador Modular", "category": "aparadores", "price": 850000, "stock": 2},
            {"id": "prod_004", "name": "Taburete Alto", "category": "taburetes", "price": 280000, "stock": 0}
        ]
    
    def get_product(self, product_id: str) -> Optional[Dict]:
        """Obtener un producto específico"""
        if not self.is_connected():
            products = self._get_demo_products()
            return next((p for p in products if p['id'] == product_id), None)
        
        try:
            doc = self.db.collection('products').document(product_id).get()
            if doc.exists:
                data = doc.to_dict()
                data['id'] = doc.id
                return data
            return None
        except Exception as e:
            print(f"Error getting product: {e}")
            return None
    
    def get_low_stock_products(self, threshold: int = 5) -> List[Dict]:
        """Obtener productos con stock bajo"""
        products = self.get_products()
        return [p for p in products if p.get('stock', 0) <= threshold]
    
    def update_product_stock(self, product_id: str, stock: int) -> bool:
        """Actualizar stock de un producto"""
        if not self.is_connected():
            print(f"Demo: Updated product {product_id} stock to {stock}")
            return True
        
        try:
            self.db.collection('products').document(product_id).update({
                'stock': stock
            })
            return True
        except Exception as e:
            print(f"Error updating product: {e}")
            return False
    
    # ============ CLIENTES ============
    
    def get_customers(self) -> List[Dict]:
        """Obtener clientes únicos de pedidos"""
        orders = self.get_orders()
        customers = {}
        
        for order in orders:
            customer = order.get('customer', {})
            email = customer.get('email') or order.get('customerEmail')
            if email and email not in customers:
                customers[email] = {
                    'email': email,
                    'name': customer.get('name') or order.get('customerName'),
                    'phone': customer.get('phone') or order.get('customerPhone'),
                    'ordersCount': 1,
                    'totalSpent': order.get('total', 0)
                }
            elif email:
                customers[email]['ordersCount'] += 1
                customers[email]['totalSpent'] += order.get('total', 0)
        
        return list(customers.values())


# Instancia global
firebase_service = FirebaseService()
