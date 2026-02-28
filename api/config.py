"""
Configuración centralizada de la API
"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuración base"""
    APP_NAME = "CREART API"
    VERSION = "3.1.0"
    
    # Ollama Cloud (IA)
    OLLAMA_API_KEY = os.environ.get('OLLAMA_API_KEY', '')
    OLLAMA_CLOUD_URL = "https://ollama.com/api/generate"
    DEFAULT_MODEL = "qwen3:8b"
    
    # Gemini (backup)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    
    # Firebase (obtener de variables de entorno)
    FIREBASE_CONFIG = {
        "type": os.environ.get('FIREBASE_TYPE', 'service_account'),
        "project_id": os.environ.get('FIREBASE_PROJECT_ID', 'creart-313b9'),
        "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID', ''),
        "private_key": os.environ.get('FIREBASE_PRIVATE_KEY', '').replace('\\n', '\n'),
        "client_email": os.environ.get('FIREBASE_CLIENT_EMAIL', ''),
        "client_id": os.environ.get('FIREBASE_CLIENT_ID', ''),
        "auth_uri": os.environ.get('FIREBASE_AUTH_URI', 'https://accounts.google.com/o/oauth2/auth'),
        "token_uri": os.environ.get('FIREBASE_TOKEN_URI', 'https://oauth2.googleapis.com/token'),
    }
    
    # Firestore
    FIRESTORE_PROJECT = os.environ.get('FIRESTORE_PROJECT', 'creart-313b9')
    
    # Flask
    DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'
    HOST = '0.0.0.0'
    PORT = int(os.environ.get('PORT', 5000))


class DevelopmentConfig(Config):
    """Configuración de desarrollo"""
    DEBUG = True


class ProductionConfig(Config):
    """Configuración de producción"""
    DEBUG = False


# Seleccionar configuración según entorno
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': ProductionConfig
}


def get_config():
    """Obtener configuración según el entorno"""
    env = os.environ.get('FLASK_ENV', 'production')
    return config.get(env, config['default'])
