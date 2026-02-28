# Workflow de Agentes - CREART

## Estructura de Ramas

| Rama | Descripción | Cuándo usarla |
|------|-------------|---------------|
| `main` | Rama principal estable | Solo para merges |
| `backend-improvements` | Mejoras del backend | APIs, Firebase, Railway |
| `frontend-updates` | Cambios del frontend | UI, componentes, páginas |
| `feature/*` | Nuevas features | Funcionalidades nuevas |
| `fix/*` | Corrección de bugs | Arreglar errores |

---

## Flujo de Trabajo con Agentes

### Paso 1: Crear rama para el agente
```bash
# Desde main, crear rama nueva
git checkout -b backend-improvements
```

### Paso 2: Ejecutar tarea con agente
```bash
# Implementar código
oh-my-opencode run implement --task="Agregar endpoint de pedidos"

# O revisar código
oh-my-opencode run review
```

### Paso 3: Commit con formato específico
```bash
# Formato: [agente]: descripción corta
git add .
git commit -m "backend: agregar endpoint pedidos"

# Ejemplos de commits:
git commit -m "coder: agregar filtros a productos"
git commit -m "reviewer: corregir errores TypeScript"
git commit -m "designer: mejorar ProductCard"
git commit -m "backend: conectar con Firebase"
```

### Paso 4: Push a GitHub
```bash
git push -u origin backend-improvements
```

### Paso 5: Crear Pull Request
1. Ve a GitHub
2. Crea PR de `backend-improvements` → `main`
3. Revisa los cambios
4. Merge cuando esté listo

---

## Tipos de Commits por Agente

| Agente | Prefijo | Ejemplo |
|--------|---------|---------|
| coder | `coder:` | `coder: agregar botón compra` |
| reviewer | `reviewer:` | `reviewer: corregir tipos` |
| researcher | `researcher:` | `researcher: investigar error API` |
| designer | `designer:` | `designer: mejorar Cards` |
| backend | `backend:` | `backend: conectar Firebase` |

---

## Reglas de Oro

1. ❌ **NO** hacer push directo a `main`
2. ✅ **SIEMPRE** usar PR para revisar cambios
3. ✅ Probar local antes de commit
4. ✅ Mensajes de commit claros y descriptivos
5. ✅ Una tarea = un commit (o varios relacionados)
6. ✅ Commits pequeños son mejores para revisar

---

## Ejemplo Completo

```bash
# 1. Asegurarse estar en main y actualizado
git checkout main
git pull origin main

# 2. Crear rama para la tarea
git checkout -b backend-improvements

# 3. Ejecutar agente para implementar
oh-my-opencode run implement --task="Agregar endpoint de pedidos"

# 4. Revisar cambios
git diff
oh-my-opencode run review

# 5. Si está todo bien, hacer commit
git add .
git commit -m "backend: agregar endpoint GET /api/orders"

# 6. Push
git push -u origin backend-improvements

# 7. Crear PR en GitHub
# Ir a: https://github.com/tu-usuario/creart-react/compare/main...backend-improvements

# 8. Después del merge, volver a main
git checkout main
git pull origin main
```

---

## Agentes Disponibles

| Agente | Modelo | Tarea principal |
|--------|--------|-----------------|
| **coder** | qwen2.5:3b | Escribir código |
| **reviewer** | qwen2.5:3b | Revisar código |
| **researcher** | phi3:latest | Investigar problemas |
| **designer** | qwen2.5:3b | Diseño UI/UX |
| **backend** | qwen2.5:3b | Firebase, APIs |

---

## Comandos Útiles

```bash
# Ver estado
git status

# Ver cambios
git diff

# Ver historial
git log --oneline -10

# Cambiar de rama
git checkout nombre-rama

# Ver ramas locales
git branch

# Ver ramas remotas
git branch -r
```
