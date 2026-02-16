import { useState } from 'react'
import { Star, Send } from 'lucide-react'
import { useApp, Product } from '../context/AppContext'

export default function ReviewsSection({ product }: { product: Product }) {
  const { addReview, getReviewsByProduct, isLoggedIn } = useApp()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const productReviews = getReviewsByProduct(product.id)
  const avgRating = productReviews.length > 0 
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length 
    : product.rating

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return
    addReview(product.id, rating, comment)
    setComment('')
    setRating(5)
  }

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">Reseñas y Comentarios</h3>
      
      {/* Promedio */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-3xl font-bold text-teal-600">{avgRating.toFixed(1)}</div>
        <div>
          <div className="flex gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-500">Basado en {productReviews.length + product.reviews} reseñas</p>
        </div>
      </div>

      {/* Formulario */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg">
          <h4 className="font-medium mb-3">Escribe tu reseña</h4>
          <div className="flex gap-1 mb-3">
            {[1,2,3,4,5].map(i => (
              <button key={i} type="button" onClick={() => setRating(i)}>
                <Star className={`w-6 h-6 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tu opinión sobre el producto..."
            className="w-full border rounded-lg p-3 mb-3"
            rows={3}
          />
          <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-teal-700">
            <Send className="w-4 h-4" /> Publicar Reseña
          </button>
        </form>
      ) : (
        <p className="text-gray-500 mb-4">Inicia sesión para escribir una reseña</p>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-4">
        {productReviews.length === 0 ? (
          <p className="text-gray-500">Sé el primero en escribir una reseña</p>
        ) : (
          productReviews.map(review => (
            <div key={review.id} className="border-b pb-4">
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
