# 🤖 Agentes con Ollama - Configuración Local

## ✅ Configuración Completa

Tu sistema está configurado para usar **Ollama** (100% gratuito y local).

---

## 🖥️ Modelos Locales Disponibles

| Modelo | Tamaño | Mejor para | Agente asignado |
|--------|--------|------------|-----------------|
| **qwen2.5:3b** | 2GB | Código general, rápido | coder, reviewer, designer, backend |
| **phi3:latest** | 2.5GB | Investigación, debugging | researcher |
| **llama3:8b** | 4.7GB | Código complejo | (disponible) |

> Los modelos más pequeños son más rápidos y funcionan bien en cualquier PC.

---

## 👥 Agentes Configurados (100% Gratis)

### 1️⃣ **coder** → qwen2.5:3b
- **Temperatura:** 0.3
- **Tareas:** Escribir código React/TypeScript
- **Comando:** `oh-my-opencode run implement`

### 2️⃣ **reviewer** → qwen2.5:3b  
- **Temperatura:** 0.4
- **Tareas:** Revisar código, detectar errores
- **Comando:** `oh-my-opencode run review`

### 3️⃣ **researcher** → phi3:latest
- **Temperatura:** 0.7
- **Tareas:** Debuggear, investigar problemas complejos
- **Comando:** `oh-my-opencode run debug`

### 4️⃣ **designer** → qwen2.5:3b
- **Temperatura:** 0.6
- **Tareas:** Diseño UI/UX, animaciones, estilos
- **Comando:** `oh-my-opencode run design-ui`

### 5️⃣ **backend** → qwen2.5:3b
- **Temperatura:** 0.3
- **Tareas:** Firebase, backend, APIs
- **Comando:** `oh-my-opencode run setup-backend`

## ✅ Configuración Completa

Tu sistema está ahora configurado para usar **Ollama** (100% gratuito y local) en lugar de APIs pagas.

---

## 🖥️ Modelos Locales Disponibles

| Modelo | Tamaño | Mejor para | Agente asignado |
|--------|--------|------------|-----------------|
| **qwen3-coder:480b-cloud** | 480B parámetros | Código, TypeScript, React | coder, reviewer |
| **deepseek-v3.1:671b-cloud** | 671B parámetros | Investigación, debugging, backend | researcher, backend |
| **gpt-oss:120b-cloud** | 120B parámetros | Diseño UI/UX, creatividad | designer |

---

## 👥 Agentes Configurados (100% Gratis)

### 1️⃣ **coder** → qwen3-coder:480b-cloud
- **Temperatura:** 0.3
- **Tareas:** Escribir código React/TypeScript
- **Comando:** `oh-my-opencode run implement`

### 2️⃣ **reviewer** → qwen3-coder:480b-cloud  
- **Temperatura:** 0.4
- **Tareas:** Revisar código, detectar errores
- **Comando:** `oh-my-opencode run review`

### 3️⃣ **researcher** → deepseek-v3.1:671b-cloud
- **Temperatura:** 0.7
- **Tareas:** Debuggear, investigar problemas complejos
- **Comando:** `oh-my-opencode run debug`

### 4️⃣ **designer** → gpt-oss:120b-cloud
- **Temperatura:** 0.6
- **Tareas:** Diseño UI/UX, animaciones, estilos
- **Comando:** `oh-my-opencode run design-ui`

### 5️⃣ **backend** → deepseek-v3.1:671b-cloud
- **Temperatura:** 0.3
- **Tareas:** Firebase, backend, APIs
- **Comando:** `oh-my-opencode run setup-backend`

---

## ⚡ Comandos Disponibles

```bash
# Implementar código
oh-my-opencode run implement --task="Agregar botón de favoritos"

# Revisar código
oh-my-opencode run review

# Debuggear
oh-my-opencode run debug --issue="El carrito no actualiza"

# Mejorar diseño
oh-my-opencode run design-ui --component="ProductCard"

# Configurar backend
oh-my-opencode run setup-backend

# Hacer preguntas generales
oh-my-opencode run ask --question="¿Cómo funciona el contexto de React?"
```

---

## 🔄 Flujo de Trabajo

```bash
# 1. Asegurarte que Ollama está corriendo
ollama serve

# 2. Crear rama para el agente
git checkout -b feature/nueva-funcion

# 3. Ejecutar agente
oh-my-opencode run implement --task="Tu tarea aquí"

# 4. Revisar con otro agente
oh-my-opencode run review

# 5. Commitear
git add .
git commit -m "[agente]: descripción"

# 6. Merge
git checkout main
git merge feature/nueva-funcion
```

---

## ✅ Ventajas de usar Ollama

| Ventaja | Descripción |
|---------|-------------|
| 💰 **100% Gratis** | Sin costos, sin límites de uso |
| 🔒 **Privacidad** | Todo queda en tu PC |
| 🌐 **Sin internet** | Funciona offline después de descargar modelos |
| ⚡ **Sin latencia** | Respuestas instantáneas (con buen hardware) |
| 🎛️ **Control total** | Configuras todo localmente |

---

## ⚠️ Consideraciones

| Aspecto | Nota |
|---------|------|
| **Velocidad** | Más lento que Claude (según tu hardware) |
| **RAM** | Requiere 16GB+ RAM recomendado |
| **GPU** | Opcional pero acelera mucho |
| **Primer uso** | La primera vez descarga los modelos (varios GB) |

---

## 🚀 Prueba Rápida

```bash
# Probar que todo funciona
oh-my-opencode run ask --question="Hola, ¿funcionas correctamente?"
```

---

## 📁 Archivos de Configuración

- **`.opencode/oh-my-opencode.json`** - Configuración principal
- **`AGENTS_GUIDE.md`** - Esta guía
- **`AGENTS_WORKFLOW.md`** - Flujo de trabajo con ramas

---

## 🔧 Solución de Problemas

### Si Ollama no responde:
```bash
# Verificar que está corriendo
curl http://localhost:11434/api/tags

# Reiniciar Ollama
ollama serve
```

### Si un modelo es muy lento:
- Cierra otras aplicaciones
- Usa un modelo más pequeño (si tienes disponible)
- Considera usar GPU si tienes

---

## 💡 Tip: Uso Eficiente

Los modelos grandes (480B-671B) son potentes pero lentos. Para tareas simples:

1. Usa `qwen3-coder` para código rápido
2. Guarda respuestas en archivos para referencia
3. Usa contexto del proyecto para mejores resultados

---

**¡Todo listo para trabajar con agentes 100% gratuitos!** 🎉
