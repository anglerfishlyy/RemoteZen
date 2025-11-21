"use client"

import TimerPage from '@/components/TimerPage'
import { useRouter } from 'next/navigation'

export default function Timer() {
  const router = useRouter()

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

  const handleLogout = () => {
    router.push('/login')
  }

  return <TimerPage onNavigate={handleNavigate} onLogout={handleLogout} />
}
