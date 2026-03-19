# 🤖 Agentes Configurados - CREART

## Modelos Gratuitos Utilizados

| Proveedor | Modelo | Costo | Especialidad |
|-----------|--------|-------|--------------|
| **Ollama (Local)** | qwen2.5:3b | ✅ Gratis | Código general |
| **Ollama (Local)** | phi3:latest | ✅ Gratis | Investigación |
| **Ollama (Local)** | llama3:8b | ✅ Gratis | Código complejo |

## Agentes Disponibles (Ollama Local)

| Agente | Modelo | Temperatura | Especialidad |
|--------|--------|-------------|--------------|
| **coder** | qwen2.5:3b | 0.3 | Escribir código limpio |
| **reviewer** | qwen2.5:3b | 0.4 | Revisar y detectar errores |
| **researcher** | phi3:latest | 0.7 | Investigar y debuggear |
| **designer** | qwen2.5:3b | 0.6 | Diseño UI/UX |
| **backend** | qwen2.5:3b | 0.3 | Backend y Firebase |

| Agente | Modelo | Temperatura | Especialidad |
|--------|--------|-------------|--------------|
| **coder** | Claude Opus 4 | 0.3 | Escribir código limpio |
| **reviewer** | Claude Opus 4 | 0.4 | Revisar y detectar errores |
| **researcher** | Claude Opus 4 | 0.7 | Investigar y debuggear |
| **designer** | Claude Opus 4 | 0.6 | Diseño UI/UX |
| **backend** | Claude Opus 4 | 0.3 | Backend y Firebase |

## Comandos Disponibles

### `implement`
Implementa una feature o cambio de código
```bash
oh-my-opencode run implement --task="Agregar botón de compra rápida"
```

### `review`
Revisa los cambios no commiteados
```bash
oh-my-opencode run review
```

### `debug`
Investiga y soluciona un bug
```bash
oh-my-opencode run debug --issue="El carrito no se actualiza"
```

### `design-ui`
Mejora el diseño de componentes
```bash
oh-my-opencode run design-ui --component="ProductCard"
```

### `setup-backend`
Configura Firebase backend
```bash
oh-my-opencode run setup-backend
```

## Flujo de Trabajo Recomendado

1. **Planificar**: Discutir cambios con el orquestador
2. **Implementar**: Usar `implement` para escribir código
3. **Revisar**: Usar `review` para verificar calidad
4. **Testear**: Probar localmente
5. **Commitear**: Git add, commit, push
6. **Merge**: Crear PR a main

## Ejemplo Completo

```bash
# 1. Crear nueva rama para el agente
git checkout -b feature/nueva-funcion

# 2. Implementar con el agente coder
oh-my-opencode run implement --task="Agregar filtro por precio"

# 3. Revisar código
oh-my-opencode run review

# 4. Commitear
git add .
git commit -m "coder: agregar filtro por precio"

# 5. Subir
git push -u origin feature/nueva-funcion

# 6. Merge a main
git checkout main
git merge feature/nueva-funcion
```

## Configuración

Archivo: `.opencode/oh-my-opencode.json`

Puedes modificar:
- Modelos de IA
- Temperaturas
- System prompts
- Comandos personalizados

## Notas

- Los agentes usan **Ollama local** (100% gratuito, sin API key)
- Cada agente tiene su propio contexto y memoria
- Los agentes pueden comunicarse entre sí
- Las tareas se ejecutan en paralelo cuando es posible

- Los agentes usan la API de Claude (necesita API key)
- Cada agente tiene su propio contexto y memoria
- Los agentes pueden comunicarse entre sí
- Las tareas se ejecutan en paralelo cuando es posible
