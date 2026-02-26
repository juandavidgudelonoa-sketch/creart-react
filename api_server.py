# API Flask para CREART
# Ejecutar: python api_server.py
# Puerto: http://localhost:5000

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permitir solicitudes desde React

@app.route('/api/health', methods=['GET'])
def health():
    """Verifica que el servidor esta corriendo"""
    return jsonify({
        "status": "ok",
        "message": "CREART API funcionando",
        "version": "1.0.0"
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """
    Chat simple con IA
    Enviar: { "message": "tu mensaje" }
    """
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({
                "error": "Falta el campo 'message'"
            }), 400
        
        user_message = data['message']
        
        # Aquí puedes integrar Ollama, OpenAI, o cualquier IA
        # Por ahora respondemos con un mensaje ejemplo
        
        response = {
            "success": True,
            "reply": f"Recibí tu mensaje: {user_message}. Esta es la API de CREART."
        }
        
        return jsonify(response)
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/process', methods=['POST'])
def process_prompt():
    """
    Procesa una tarea
    Enviar: { "task": "tu tarea", "type": "frontend|backend|design" }
    """
    try:
        data = request.get_json()
        
        if not data or 'task' not in data:
            return jsonify({
                "error": "Falta el campo 'task'"
            }), 400
        
        task = data['task']
        task_type = data.get('type', 'general')
        
        # Respuesta ejemplo - aquí integrarías los agentes
        resultado = {
            "task": task,
            "type": task_type,
            "status": "procesado",
            "message": f"Tarea '{task}' de tipo '{task_type}' recibida"
        }
        
        return jsonify({
            "success": True,
            "data": resultado
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    
    print("Iniciando CREART API...")
    print(f"Endpoint: http://localhost:{port}")
    print("Endpoints disponibles:")
    print("   GET  /api/health          - Verificar estado")
    print("   POST /api/chat            - Chat con IA")
    print("   POST /api/process         - Procesar tarea")
    print()
    
    app.run(host='0.0.0.0', port=port, debug=False)
