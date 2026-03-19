#!/usr/bin/env python
# Wrapper para usar el Orquestador desde linea de comandos
# Uso: python run_orchestrator.py "tu prompt aqui"

import sys
import json

# Agregar el path del Orquestador
sys.path.append(r"C:\Users\equipo\Agent-Workflow\OrquestadorMemory id versions\v3.0")

from PROMPT_ENG.bucle_orquestador_promptengineer import ejecutar_workflow_completo

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python run_orchestrator.py 'tu prompt aqui'")
        sys.exit(1)
    
    prompt = sys.argv[1]
    resultado = ejecutar_workflow_completo(prompt)
    
    # Output JSON para parsing facil
    print("---RESULT_JSON_START---")
    print(json.dumps(resultado))
    print("---RESULT_JSON_END---")
