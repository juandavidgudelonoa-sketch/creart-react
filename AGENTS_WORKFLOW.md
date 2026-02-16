# Workflow de Agentes - CREART

## Ramas de trabajo

| Rama | Agente | Descripción |
|------|--------|-------------|
| `main` | - | Rama principal estable |
| `frontend-agent` | Interfaz | UI/UX, componentes, páginas |
| `products-agent` | Productos | Catálogo, imágenes, precios |
| `features-agent` | Funciones | Nuevas features |
| `fixes-agent` | Bugs | Corrección de errores |

## Flujo de trabajo

```
1. Cada agente trabaja en SU rama
   - git checkout [rama-del-agente]
   - hace cambios
   - git add .
   - git commit -m "Agente: descripción"

2. Push a GitHub
   - git push -u origin [rama-del-agente]

3. Pull Request a main
   - Ir a GitHub
   - Crear PR de [rama] → main
   - Revisar cambios
   - Merge
```

## Reglas

1. ❌ NO hacer push directamente a main
2. ✅ Siempre hacer PR para revisar cambios
3. ✅ Probar local antes de hacer commit
4. ✅ Mensajes de commit claros

## Ejemplo de uso

```bash
# Agente de productos quiere agregar un producto
git checkout products-agent
# hace cambios...
git add .
git commit -m "products-agent: agregar 5 sillas nuevas"
git push -u origin products-agent

# Luego crea PR en GitHub: products-agent → main
```

## Agentes disponibles

- 🤖 **frontend-agent**: Juan David
- 📦 **products-agent**: Juan David  
- ✨ **features-agent**: Juan David
- 🔧 **fixes-agent**: Juan David
