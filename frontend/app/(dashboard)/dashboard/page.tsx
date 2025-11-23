'use client'

import Dashboard from '@/components/Dashboard'
import { useAuth } from '../../providers'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function DashboardPage() {
  const router = useRouter()
  const { logout } = useAuth()
  const { data: session, status } = useSession()

  // Fix: Only redirect to login if session is truly missing (not just loading)
  // This prevents redirect loops during OAuth callback
  useEffect(() => {
    // Wait for session to finish loading before checking
    if (status === 'unauthenticated' && !session) {
      // Small delay to ensure this isn't a transient state during OAuth callback
      const timer = setTimeout(() => {
        if (status === 'unauthenticated' && !session) {
          router.push('/login')
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [status, session, router])

  const handleNavigate = (page: 'landing' | 'analytics' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'profile') => {
    switch(page) {
      case 'landing': router.push('/'); break
      case 'analytics': router.push('/analytics'); break
      case 'login': router.push('/login'); break
      case 'dashboard': router.push('/dashboard'); break
      case 'tasks': router.push('/tasks'); break
      case 'timer': router.push('/timer'); break
      case 'profile': router.push('/profile'); break
    }
  }

  // Show loading state while session is being checked
  // Fix: Prevents flash of content before redirect
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return <Dashboard onNavigate={handleNavigate} onLogout={logout} />
}
