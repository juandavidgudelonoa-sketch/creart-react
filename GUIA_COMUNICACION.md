# 🎯 Guía de Comunicación Conmigo - CREART

## Mi Stack Tecnológico
| Tecnología | Para qué lo uso |
|------------|-----------------|
| **Vite** | Build tool ultra-rápido |
| **React 18** | Librería de UI |
| **React Router v7** | Navegación |
| **Tailwind CSS** | Estilos utility-first |
| **TypeScript** | Tipado estático |
| **Firebase** | Auth + Firestore (Backend) |
| **Ollama** | Modelos IA locales |
| **Lucide React** | Iconos |
| **Context API** | Estado global |

---

## Cómo me hablas vs Cómo lo traduzco

Cuando me dices algo en tus palabras, yo lo traduzco automáticamente al mejor formato para el agente que corresponda. Así funciona mi mente:

---

## 📝 Ejemplos de Traducción (con tu stack)

### Ejemplo 1: Código React + Tailwind
| Tú dices | Yo traduzco para el agente coder |
|----------|----------------------------------|
| "un botón que brilla cuando paso el mouse" | `Componente React + Tailwind: Button con efecto glow, usa tailwind: hover:glow, bg-gradient, transition-all` |

### Ejemplo 2: Firebase/Auth
| Tú dices | Yo traduzco para el agente |
|----------|---------------------------|
| "quiero que los usuarios puedan iniciar sesión con Google" | `Implementar Firebase Auth con Google Provider en AuthContext, usar signInWithPopup de firebase/auth` |

### Ejemplo 3: Componente UI
| Tú dices | Yo traduzco |
|----------|------------|
| "una card de producto con imagen, precio y botón" | `Crear ProductCard.tsx con: imagen aspect-square, precio en COP, botón "Añadir al cart", usar Lucide icons` |

### Ejemplo 4: Diseño
| Tú dices | Yo traduzco para Midjourney/DALL-E |
|----------|-----------------------------------|
| "un logo para una tienda de muebles, elegante, color madera" | `/imagine prompt: elegant furniture store logo, warm wood tones, minimalist, --ar 1:1 --v 6`

---

## 🎬 Modelos y Agentes Disponibles

### Tus Agentes Configurados (Ollama)

| Agente | Modelo | Para qué lo uso | Temperatura |
|--------|--------|-----------------|-------------|
| **coder** | qwen3-coder:480b-cloud | Código, TypeScript, React | 0.3 |
| **reviewer** | qwen3-coder:480b-cloud | Revisar código | 0.4 |
| **researcher** | deepseek-v3.1:671b-cloud | Investigación, debug | 0.7 |
| **designer** | gpt-oss:120b-cloud | Diseño UI/UX | 0.6 |
| **backend** | deepseek-v3.1:671b-cloud | Firebase, Node.js | 0.3 |

### Cuándo uso cada uno

- **coder/reviewer**: Cuando dices "código", "bug", "componente", "crear", "implementar"
- **researcher**: Cuando dices "busca", "investiga", "por qué no funciona"
- **designer**: Cuando dices "imagen", "diseño", "logo", "UI"
- **backend**: Cuando dices "Firebase", "auth", "base de datos", "API"

---

## 🔑 Palabras Clave que Activan Agentes

| Palabra clave | Agente activado |
|---------------|-----------------|
| imagen, foto, diseño, logo, banner, arte, UI | **designer** (gpt-oss) |
| código, bug, error, componente, función, crear, React, Tailwind | **coder** (qwen3-coder) |
| firebase, auth, backend, base de datos, API | **backend** (deepseek-v3.1) |
| busca, investiga, cómo hacer, por qué, solución | **researcher** (deepseek-v3.1) |
| revisar, revisar código, review | **reviewer** (qwen3-coder) |
| cualquier otra cosa | **General** |

---

## 📋 Estructura de Mi Traducción

Cuando traduzco tu mensaje para código, sigo tu stack:

```
TECNOLOGÍA: React 18 + TypeScript + Tailwind CSS + Vite
COMPONENTES: useState, useEffect, Context API
ICONOS: Lucide React
BACKEND: Firebase (Auth + Firestore)
IA: Ollama (modelos locales)

FORMATO:
1. Rol: Eres desarrollador React+TS+Tailwind
2. Contexto: Descripción del proyecto (CREART - tienda muebles)
3. Tarea: Qué necesitas
4. Restricciones: Tailwind classes, Lucide icons
5. Output: Código TypeScript
```

---

## 🚀 Cómo Usarme (con tu stack)

1. **Escríbeme** en tus palabras
2. **Yo detecto** el agente necesario (coder, designer, researcher, etc.)
3. **Traduzco** usando React + Tailwind + TypeScript
4. **Ejecuto** o te doy el código listo

### Ejemplo de Conversación Real:

**Tú**: "quiero un botón rojo para añadir al carrito"

**Yo tradusco**:
```tsx
import { ShoppingCart } from 'lucide-react'

export function AddToCartButton() {
  return (
    <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all">
      <ShoppingCart className="w-5 h-5" />
      Añadir al carrito
    </button>
  )
}
```

---

## 🎯 Ejemplos Rápidos (tu proyecto)

| Tú dices | Yo hago |
|----------|---------|
| "busca errores en mi login de Firebase" | Investigo AuthContext y Firebase config |
| "una imagen de una silla de madera" | Prompt para Midjourney |
| "el navbar no funciona en móvil" | Analizo Navbar.tsx con Tailwind responsive |
| "quiero mejorar la velocidad" | Investigo React.lazy, memo, useMemo |
| "agrega auth con Google" | Código Firebase Auth con Google Provider |

---

## 💡 Consejo

Mientras más contexto me des, mejor traduzco. Por ejemplo:

- ❌ "un botón" 
- ✅ "un botón para el carrito de compras, rojo, que diga 'comprar ahora'"

¡Escríbeme y veamos cómo funciona!
