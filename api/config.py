"""
Configuración centralizada de la API
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración general
class Config:
    """Configuración base"""
    APP_NAME = "CREART API"
    VERSION = "3.0.0"
    
    # Ollama Cloud
    OLLAMA_API_KEY = os.environ.get('OLLAMA_API_KEY', 'e185ba1debd84ff0bd94924a6096ab23.eGdoIycVgx1pKrrhkhQBGeFU')
    OLLAMA_CLOUD_URL = "https://ollama.com/api/generate"
    DEFAULT_MODEL = "qwen3-coder:480b-cloud"
    OLLAMA_API_KEY = os.environ.get('OLLAMA_API_KEY', '')
    OLLAMA_CLOUD_URL = "https://ollama.com/api/generate"
    DEFAULT_MODEL = "qwen3-coder:480b-cloud"
    
    # Gemini (backup)
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY', '')
    
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
