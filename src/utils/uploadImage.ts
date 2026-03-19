import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../firebase'
import { compressImage, blobToFile, formatFileSize, validateImage } from './imageUtils'

interface UploadOptions {
  onProgress?: (progress: number) => void
  onError?: (error: Error) => void
  onSuccess?: (url: string) => void
  compress?: boolean
}

export const uploadImage = async (
  file: File, 
  folder: string = 'products',
  options?: UploadOptions
): Promise<string> => {
  const { compress = true } = options || {}
  
  return new Promise(async (resolve, reject) => {
    try {
      let fileToUpload = file
      
      // Comprimir imagen si está habilitado
      if (compress) {
        // Validar imagen primero
        const validation = validateImage(file)
        if (!validation.valid) {
          reject(new Error(validation.error))
          return
        }
        
        // Comprimir imagen
        const compressedBlob = await compressImage(file, {
          maxWidth: 1200,
          maxHeight: 1200,
          quality: 0.8,
          format: 'jpeg'
        })
        
        console.log(`📸 Imagen comprimida: ${formatFileSize(file.size)} → ${formatFileSize(compressedBlob.size)}`)
        
        // Convertir blob a file
        fileToUpload = blobToFile(compressedBlob, file.name)
      }
      
      // Generar nombre único
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(7)
      const fileName = `${timestamp}-${random}-${fileToUpload.name.replace(/\.[^/.]+$/, '')}.jpg`
      const storageRef = ref(storage, `${folder}/${fileName}`)

      const uploadTask = uploadBytesResumable(storageRef, fileToUpload)

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          options?.onProgress?.(progress)
        },
        (error) => {
          console.error('Error uploading:', error)
          options?.onError?.(error)
          reject(error)
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          options?.onSuccess?.(downloadURL)
          resolve(downloadURL)
        }
      )
    } catch (error) {
      console.error('Error preparing image:', error)
      reject(error)
    }
  })
}

export const uploadMultipleImages = async (
  files: File[],
  folder: string = 'products',
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> => {
  const urls: string[] = []
  
  for (let i = 0; i < files.length; i++) {
    const url = await uploadImage(files[i], folder, {
      onProgress: (progress) => onProgress?.(i, progress)
    })
    urls.push(url)
  }
  
  return urls
}

export const deleteImage = async (url: string): Promise<void> => {
  try {
    const imageRef = ref(storage, url)
    await deleteObject(imageRef)
  } catch (error) {
    console.error('Error deleting image:', error)
    // No lanzar error si la imagen no existe
  }
}

export const deleteMultipleImages = async (urls: string[]): Promise<void> => {
  await Promise.all(urls.map(url => deleteImage(url)))
}

// Helper para obtener URL de imagen por defecto
export const getDefaultProductImage = (category: string): string => {
  const defaultImages: Record<string, string> = {
    sillas: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
    mesas: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=400&h=300&fit=crop',
    taburetes: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=400&h=300&fit=crop',
    aparadores: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
    armarios: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop',
    zapateras: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop',
    repisas: 'https://images.unsplash.com/photo-1597072689227-8882273e8f6a?w=400&h=300&fit=crop',
    escritorios: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
  }
  return defaultImages[category] || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop'
}
