import { useState } from 'react';
import { useOrquestador } from '../hooks/useOrquestador';

interface OrquestadorDemoProps {
  /** Callback cuando se determina un workflow */
  onWorkflowDeterminado?: (workflow: string) => void;
  /** Callback cuando se procesa un prompt */
  onPromptProcesado?: (resultado: any) => void;
}

/**
 * Componente de demo para probar el Orquestador Python
 * 
 * Uso:
 * 
 * <OrquestadorDemo 
 *   onWorkflowDeterminado={(wf) => console.log(wf)}
 *   onPromptProcesado={(r) => console.log(r)}
 * />
 */
export function OrquestadorDemo({ 
  onWorkflowDeterminado, 
  onPromptProcesado 
}: OrquestadorDemoProps) {
  const [prompt, setPrompt] = useState('');
  
  const { 
    isLoading, 
    error, 
    resultado,
    procesarPrompt, 
    determinarWorkflow,
    verificarSalud,
    reset 
  } = useOrquestador();

  const [servidorActivo, setServidorActivo] = useState<boolean | null>(null);

  // Verificar salud del servidor
  const handleVerificarSalud = async () => {
    const activo = await verificarSalud();
    setServidorActivo(activo);
  };

  // Procesar prompt
  const handleProcesar = async () => {
    if (!prompt.trim()) return;
    
    const result = await procesarPrompt(prompt);
    if (result && onPromptProcesado) {
      onPromptProcesado(result);
    }
  };

  // Solo determinar workflow (sin ejecutar)
  const handleDeterminar = async () => {
    if (!prompt.trim()) return;
    
    const workflow = await determinarWorkflow(prompt);
    if (workflow && onWorkflowDeterminado) {
      onWorkflowDeterminado(workflow);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm max-w-md">
      <h2 className="text-lg font-bold mb-4">Orquestador Python Demo</h2>
      
      {/* Estado del servidor */}
      <div className="mb-4">
        <button
          onClick={handleVerificarSalud}
          className="text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          Verificar Servidor
        </button>
        {servidorActivo !== null && (
          <span className={`ml-2 text-sm ${servidorActivo ? 'text-green-600' : 'text-red-600'}`}>
            {servidorActivo ? 'Servidor activo' : 'Servidor no disponible'}
          </span>
        )}
      </div>

      {/* Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Prompt:</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe tu prompt aqui..."
          className="w-full p-2 border rounded resize-none"
          rows={3}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={handleProcesar}
          disabled={isLoading || !prompt.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? 'Procesando...' : 'Procesar Prompt'}
        </button>
        
        <button
          onClick={handleDeterminar}
          disabled={isLoading || !prompt.trim()}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
        >
          Solo Determinar
        </button>
        
        <button
          onClick={reset}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Limpiar
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {/* Resultado */}
      {resultado && (
        <div className="p-3 bg-green-100 border border-green-400 rounded">
          <h3 className="font-bold text-green-800">Resultado:</h3>
          <p className="text-sm"><strong>Ciclos:</strong> {resultado.ciclos}</p>
          <p className="text-sm"><strong>Aprobado:</strong> {resultado.aprobado ? 'Si' : 'No'}</p>
          <p className="text-sm"><strong>Workflow:</strong> {resultado.workflow}</p>
          <p className="text-sm"><strong>Prompt mejorado:</strong> {resultado.prompt_final}</p>
        </div>
      )}
    </div>
  );
}

export default OrquestadorDemo;
