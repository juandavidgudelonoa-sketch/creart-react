# API Flask para el Orquestador Python
# Ejecutar: python api_server.py
# Puerto: http://localhost:5000

from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os

# Agregar el path del Orquestador
sys.path.append(r"C:\Users\equipo\Agent-Workflow\OrquestadorMemory id versions\v3.0")

from PROMPT_ENG.bucle_orquestador_promptengineer import (
    OrquestadorConPE, 
    ejecutar_workflow_completo
)

app = Flask(__name__)
CORS(app)  # Permitir solicitudes desde React

# Instancia global del orquestador
orquestador = OrquestadorConPE()

@app.route('/api/health', methods=['GET'])
def health():
    """Verifica que el servidor esta corriendo"""
    return jsonify({
        "status": "ok",
        "message": "Orquestador API funcionando",
        "version": "1.0.0"
    })

@app.route('/api/process', methods=['POST'])
def process_prompt():
    """
    Procesa un prompt a traves del Orquestador
    Enviar: { "prompt": "tu prompt aqui" }
    Retorna: { resultado del workflow }
    """
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({
                "error": "Falta el campo 'prompt' en la solicitud"
            }), 400
        
        prompt_usuario = data['prompt']
        
        # Ejecutar el workflow completo
        resultado = ejecutar_workflow_completo(prompt_usuario)
        
        return jsonify({
            "success": True,
            "data": resultado
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/workflow/determinar', methods=['POST'])
def determinar_workflow():
    """
    Solo determina que workflow usar sin ejecutar
    Util para saber que tipo de tarea es
    """
    try:
        data = request.get_json()
        
        if not data or 'prompt' not in data:
            return jsonify({
                "error": "Falta el campo 'prompt'"
            }), 400
        
        workflow = orquestador._determinar_workflow(data['prompt'])
        
        return jsonify({
            "success": True,
            "workflow": workflow,
            "prompt": data['prompt']
        })
    
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/workflow/ejecutar', methods=['POST'])
def ejecutar_workflow():
    """
    Ejecuta un workflow especifico
    """
    try:
        data = request.get_json()
        
        if not data or 'workflow' not in data:
            return jsonify({
                "error": "Falta el campo 'workflow'"
            }), 400
        
        workflow = data['workflow']
        prompt = data.get('prompt', '')
        
        resultado = orquestador.delegar_workflow(workflow, prompt)
        
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
    print("Iniciando Orquestador API...")
    print("Endpoint: http://localhost:5000")
    print("Endpoints disponibles:")
    print("   GET  /api/health          - Verificar estado")
    print("   POST /api/process         - Procesar prompt completo")
    print("   POST /api/workflow/determinar - Determinar workflow")
    print("   POST /api/workflow/ejecutar  - Ejecutar workflow")
    print()
    
    app.run(host='0.0.0.0', port=5000, debug=True)
