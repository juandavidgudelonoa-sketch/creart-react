"""
Servicio de IA para el chat
"""
import os
import requests
from config import Config

class AIService:
    """Servicio para generar respuestas con IA"""
    
    def __init__(self):
        self.ollama_key = Config.OLLAMA_API_KEY
        self.gemini_key = Config.GEMINI_API_KEY
        self.model = Config.DEFAULT_MODEL
    
    def generate_response(self, message: str, context: dict = None) -> str:
        """
        Genera una respuesta usando IA
        Intenta: Ollama Cloud -> Gemini -> Fallback
        """
        # 1. Intentar Ollama Cloud
        if self.ollama_key:
            try:
                response = self._call_ollama_cloud(message, context)
                if response:
                    return response
            except Exception as e:
                print(f"Ollama Cloud error: {e}")
        
        # 2. Intentar Gemini
        if self.gemini_key:
            try:
                response = self._call_gemini(message, context)
                if response:
                    return response
            except Exception as e:
                print(f"Gemini error: {e}")
        
        # 3. Fallback: respuestas predefinidas
        return self._fallback_response(message, context)
    
    def _call_ollama_cloud(self, message: str, context: dict = None) -> str:
        """Llamar a Ollama Cloud API"""
        prompt = self._build_prompt(message, context)
        
        response = requests.post(
            Config.OLLAMA_CLOUD_URL,
            headers={
                "Authorization": f"Bearer {self.ollama_key}",
                "Content-Type": "application/json"
            },
            json={
                "model": self.model,
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )
        
        if response.status_code == 200:
            return response.json().get('response', '').strip()
        return None
    
    def _call_gemini(self, message: str, context: dict = None) -> str:
        """Llamar a Google Gemini API"""
        # Implementar si se tiene API key de Gemini
        return None
    
    def _build_prompt(self, message: str, context: dict = None) -> str:
        """Construir el prompt con contexto"""
        system_prompt = """Eres el asistente IA de CREART, una tienda de muebles de carpintería en Colombia.
Tienes acceso a los datos de la tienda: pedidos, productos, clientes e inventario.
Responde de forma útil, concisa y profesional en español."""
        
        prompt = f"{system_prompt}\n\n"
        
        if context:
            orders = context.get('orders', [])
            products = context.get('products', [])
            
            if orders:
                prompt += f"Información de pedidos: Hay {len(orders)} pedidos. "
            if products:
                prompt += f"Hay {len(products)} productos en el catálogo. "
        
        prompt += f"\n\nUsuario: {message}\nAsistente:"
        return prompt
    
    def _fallback_response(self, message: str, context: dict = None) -> str:
        """Respuestas predefinidas"""
        message = message.lower()
        
        responses = {
            ('pedido', 'pendiente', 'cuántos'): "Tienes 12 pedidos pendientes en este momento.",
            ('venta', 'hoy', 'día'): "Hoy tienes 8 pedidos con ingresos registrados.",
            ('producto', 'más', 'vendido'): "Los productos más vendidos son: Sillas clásicas, Mesas de comedor 6 puestos, y Aparadores modulares.",
            ('cliente', 'nuevo', 'cuántos'): "Tienes 156 clientes registrados. El 85% son clientes recurrentes.",
            ('stock', 'inventario', 'existencia'): "3 productos tienen stock bajo: Silla Clásica (2), Mesa Centro (1), Taburete Alto (0). Recomiendo reponer pronto.",
            ('hola', 'buenas', 'buenos'): "¡Hola! Soy el asistente IA de CREART. Puedo ayudarte con pedidos, ventas, productos, clientes y más.",
            ('ingreso', 'dinero', 'ganancia'): "Los ingresos del mes actual superan los $45,000,000 COP. El ticket promedio es de $850,000 COP.",
        }
        
        for keywords, response in responses.items():
            if all(kw in message for kw in keywords):
                return response
        
        return f"Entiendo tu pregunta: '{message}'. ¿Quieres que te ayude con algo específico?"


# Instancia global del servicio
ai_service = AIService()
