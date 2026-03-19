// Utilidades para comprimir y redimensionar imágenes

interface CompressOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp'
}

/**
 * Comprime una imagen antes de subirla
 * @param file - Archivo de imagen
 * @param options - Opciones de compresión
 * @returns - Blob comprimida
 */
export const compressImage = async (
  file: File,
  options: CompressOptions = {}
): Promise<Blob> => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.8,
    format = 'jpeg'
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target?.result as string
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        
        // Calcular nuevas dimensiones manteniendo proporción
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto'))
          return
        }
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convertir a Blob con la compresión
        const mimeType = `image/${format}`
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Error al comprimir imagen'))
            }
          },
          mimeType,
          quality
        )
      }
      
      img.onerror = () => reject(new Error('Error al cargar imagen'))
    }
    
    reader.onerror = () => reject(new Error('Error al leer archivo'))
  })
}

/**
 * Convierte un Blob a File
 */
export const blobToFile = (blob: Blob, fileName: string): File => {
  return new File([blob], fileName, {
    type: blob.type,
    lastModified: Date.now()
  })
}

/**
 * Obtiene el tamaño de archivo en formato legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Valida que el archivo sea una imagen
 */
export const validateImage = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Tipo de archivo no válido. Usa JPEG, PNG o WebP' }
  }
  
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    return { valid: false, error: 'La imagen es muy grande. Máximo 10MB' }
  }
  
  return { valid: true }
}

/**
 * Crea una previsualización de imagen
 */
export const createPreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    
    reader.onload = () => {
      resolve(reader.result as string)
    }
    
    reader.onerror = () => reject(new Error('Error al crear previsualización'))
  })
}
