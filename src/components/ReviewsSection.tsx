import { useState, useEffect } from 'react'
import { Star, Send, User, LogIn, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../contexts/AuthContext'
import { useApp } from '../context/AppContext'
import type { Product } from '../context/AppContext'

interface Review {
  id: string
  productId: string
  userName: string
  userEmail?: string
  rating: number
  comment: string
  date: string
  createdAt?: any
}

export default function ReviewsSection({ product }: { product: Product }) {
  const auth = useAuth()
  const appContext = useApp()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  // Verificar si está logueado - esperar a que auth cargue Y revisar ambos sistemas
  const isLoggedIn = !auth.loading && (auth.isLoggedIn || auth.user !== null || appContext.isLoggedIn || appContext.user !== null)
  const userName = auth.customer?.name || auth.user?.name || appContext.user?.name || 'Usuario'
  const userEmail = auth.user?.email || auth.customer?.email || appContext.user?.email || ''

  // Cargar reseñas de Firestore
  useEffect(() => {
    if (!product?.id) return
    
    const loadReviews = async () => {
      try {
        // Primero intentamos sin índice para evitar el error
        const q = query(
          collection(db, 'reviews'),
          where('productId', '==', product.id)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
          const reviewsData: Review[] = []
          snapshot.forEach((doc) => {
            reviewsData.push({
              id: doc.id,
              ...doc.data()
            } as Review)
          })
          // Ordenar localmente por createdAt
          reviewsData.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.date)
            const dateB = b.createdAt?.toDate?.() || new Date(b.date)
            return dateB.getTime() - dateA.getTime()
          })
          setReviews(reviewsData)
          setLoading(false)
        }, (error) => {
          console.error('Error en listener de reseñas:', error)
          setLoading(false)
        })

        return () => unsubscribe()
      } catch (error) {
        console.error('Error loading reviews:', error)
        setLoading(false)
      }
    }

    loadReviews()
  }, [product?.id])

  // Calcular promedio
  const avgRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : product?.rating || 0
  
  const totalReviews = reviews.length + (product?.reviews || 0)

  // Enviar reseña a Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !isLoggedIn) return

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: product.id,
        productName: product.name,
        userName: userName,
        userEmail: userEmail,
        rating: rating,
        comment: comment.trim(),
        date: new Date().toLocaleDateString('es-CO'),
        createdAt: new Date()
      })
      
      setComment('')
      setRating(5)
    } catch (error) {
      console.error('Error submitting review:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Si no hay producto, no renderizar
  if (!product) return null

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Reseñas y Comentarios</h3>
      
      {/* Debug info */}
      <div className="text-xs text-gray-400 mb-2 p-2 bg-gray-100 rounded">
        Usuario: {auth.user?.email || 'No logueado'} | isLoggedIn: {String(isLoggedIn)} | loading: {String(auth.loading)}
      </div>
      
      {/* Promedio */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-3xl font-bold text-teal-600">{avgRating.toFixed(1)}</div>
        <div>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-500">Basado en {totalReviews} reseñas</p>
        </div>
      </div>

      {/* Formulario */}
      {auth.loading ? (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
          <p className="text-gray-500 mt-2">Cargando...</p>
        </div>
      ) : isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-teal-600" />
            </div>
            <span className="font-medium text-gray-700">{userName}</span>
          </div>
          <h4 className="font-medium mb-3 text-gray-700">Escribe tu reseña</h4>
          <div className="flex gap-1 mb-3" role="group" aria-label="Calificación">
            {[1,2,3,4,5].map(i => (
              <button 
                key={i} 
                type="button" 
                onClick={() => setRating(i)}
                className="hover:scale-110 transition-transform"
                aria-label={`${i} estrellas`}
              >
                <Star className={`w-7 h-7 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'}`} />
              </button>
            ))}
          </div>
          <textarea
            name="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tu opinión sobre el producto..."
            className="w-full border border-gray-200 rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows={3}
            disabled={submitting}
          />
          <button 
            type="submit" 
            disabled={submitting || !comment.trim()}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {submitting ? 'Enviando...' : 'Publicar Reseña'}
          </button>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600 mb-3">Inicia sesión para escribir una reseña</p>
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <LogIn className="w-4 h-4" /> Iniciar Sesión
          </Link>
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-4">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-600" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Sé el primero en escribir una reseña</p>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="border-b pb-4 last:border-b-0">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{review.userName}</p>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-400">{review.date}</span>
              </div>
              <p className="mt-2 text-gray-600">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
