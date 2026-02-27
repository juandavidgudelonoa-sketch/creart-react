"""
CREART API - Aplicación principal
Estructura organizada con Blueprints
"""
from flask import Flask, jsonify
from flask_cors import CORS
import os

from config import get_config
from routes import api_bp


def create_app(config_name='production'):
    """Factory para crear la aplicación Flask"""
    
    app = Flask(__name__)
    
    # Cargar configuración
    config = get_config()
    app.config['DEBUG'] = config.DEBUG
    
    # CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Registrar Blueprints
    app.register_blueprint(api_bp)
    
    # Ruta raíz
    @app.route('/')
    def index():
        return jsonify({
            "name": config.APP_NAME,
            "version": config.VERSION,
            "status": "running"
        })
    
    # Manejo de errores
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Endpoint no encontrado"}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"error": "Error interno del servidor"}), 500
    
    return app


# Crear aplicación
app = create_app()


if __name__ == '__main__':
    config = get_config()
    print(f"Iniciando {config.APP_NAME} v{config.VERSION}")
    print(f"Puerto: {config.PORT}")
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)
