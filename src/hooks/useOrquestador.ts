import { useState, useCallback } from 'react';

// URL del servidor Python (Ollama API)
const ORQUESTADOR_API_URL = 'http://localhost:5000/api';

interface WorkflowResult {
  prompt_original: string;
  ciclos: number;
  prompt_final: string;
  aprobado: boolean;
  workflow: string;
  timestamp_inicio: string;
  timestamp_fin: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UseOrquestadorReturn {
  // Estado
  isLoading: boolean;
  error: string | null;
  resultado: WorkflowResult | null;
  
  // Metodos
  procesarPrompt: (prompt: string) => Promise<WorkflowResult | null>;
  determinarWorkflow: (prompt: string) => Promise<string | null>;
  ejecutarWorkflow: (workflow: string, prompt?: string) => Promise<any>;
  verificarSalud: () => Promise<boolean>;
  reset: () => void;
}

/**
 * Hook para conectar con el Orquestador Python
 */
export function useOrquestador(): UseOrquestadorReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<WorkflowResult | null>(null);

  // Verificar que el servidor este corriendo
  const verificarSalud = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${ORQUESTADOR_API_URL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }, []);

  // Procesar un prompt completo a traves del Orquestador
  const procesarPrompt = useCallback(async (prompt: string): Promise<WorkflowResult | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${ORQUESTADOR_API_URL}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data: ApiResponse<WorkflowResult> = await response.json();

      if (data.success && data.data) {
        setResultado(data.data);
        return data.data;
      } else {
        const errorMsg = data.error || 'Error desconocido';
        setError(errorMsg);
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexion';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Determinar que workflow usar sin ejecutar
  const determinarWorkflow = useCallback(async (prompt: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${ORQUESTADOR_API_URL}/workflow/determinar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.success) {
        return data.workflow;
      } else {
        setError(data.error || 'Error al determinar workflow');
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexion';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ejecutar un workflow especifico
  const ejecutarWorkflow = useCallback(async (workflow: string, prompt: string = ''): Promise<any> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${ORQUESTADOR_API_URL}/workflow/ejecutar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workflow, prompt }),
      });

      const data = await response.json();

      if (data.success) {
        return data.data;
      } else {
        setError(data.error || 'Error al ejecutar workflow');
        return null;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexion';
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Resetear el estado
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setResultado(null);
  }, []);

  return {
    isLoading,
    error,
    resultado,
    procesarPrompt,
    determinarWorkflow,
    ejecutarWorkflow,
    verificarSalud,
    reset,
  };
}

export default useOrquestador;
