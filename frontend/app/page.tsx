"use client"

import { useRouter } from "next/navigation"
import LandingPage from "../components/LandingPage"

export default function Home() {
  const router = useRouter()

  const handleNavigate = (
    page: 'landing' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'profile'
  ) => {
    switch (page) {
      case 'dashboard':
        router.push('/dashboard')
        break
      case 'profile':
        router.push('/profile')
        break
      case 'tasks':
        router.push('/tasks')
        break
      case 'timer':
        router.push('/timer')
        break
      case 'login':
        router.push('/login')
        break
      default:
        router.push('/')
        break
    }
  }

  return <LandingPage onNavigate={handleNavigate} />
}

