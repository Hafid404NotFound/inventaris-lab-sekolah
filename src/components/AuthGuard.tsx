'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    console.log('AuthGuard - User:', user, 'Loading:', isLoading)
    if (!isLoading && !user) {
      console.log('AuthGuard - Redirecting to login')
      router.push('/login')
    }
  }, [user, isLoading, router])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }
  
  if (!user) {
    console.log('AuthGuard - No user, returning null')
    return null
  }
  
  console.log('AuthGuard - Rendering children')
  return <>{children}</>
}