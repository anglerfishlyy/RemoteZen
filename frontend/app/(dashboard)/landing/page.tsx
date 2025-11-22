'use client'

import LandingPage from '@/components/LandingPage'
import { useAuth } from '../../providers'
import { useRouter } from 'next/navigation'

export default function LandingPagePage() {
  const router = useRouter()
  const { logout } = useAuth()

  // Handle navigation for all possible pages
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

  return <LandingPage onNavigate={handleNavigate} />
}
