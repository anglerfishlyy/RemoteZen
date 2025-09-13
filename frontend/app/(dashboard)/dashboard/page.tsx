'use client'

import Dashboard from '@/components/Dashboard'
import { useAuth } from '../../providers'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const { logout } = useAuth()

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

  return <Dashboard onNavigate={handleNavigate} onLogout={logout} />
}
