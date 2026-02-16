import { useState, useEffect } from 'react'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <Skeleton className="w-full h-48" />
      <div className="p-4">
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2 mb-4" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function CategorySkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 text-center">
      <Skeleton className="w-16 h-16 rounded-full mx-auto mb-3" />
      <Skeleton className="h-5 w-24 mx-auto" />
    </div>
  )
}

export function CategoryGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CategorySkeleton key={i} />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero skeleton */}
      <div className="mb-12">
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
      
      {/* Categories skeleton */}
      <div className="mb-12">
        <Skeleton className="h-8 w-48 mx-auto mb-6" />
        <CategoryGridSkeleton />
      </div>
      
      {/* Products skeleton */}
      <div>
        <Skeleton className="h-8 w-48 mx-auto mb-6" />
        <ProductGridSkeleton />
      </div>
    </div>
  )
}

export function useLoading(initialState = false, delay = 500) {
  const [isLoading, setIsLoading] = useState(initialState)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, delay)
    
    return () => clearTimeout(timer)
  }, [delay])
  
  return isLoading
}

export default { Skeleton, ProductCardSkeleton, ProductGridSkeleton, CategorySkeleton, CategoryGridSkeleton, PageSkeleton, useLoading }
