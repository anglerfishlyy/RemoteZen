"use client"

import TimerPage from '@/components/TimerPage'

export default function Timer() {
  return <TimerPage onNavigate={function (page: 'landing' | 'auth' | 'dashboard' | 'tasks' | 'timer' | 'profile'): void {
      throw new Error('Function not implemented.')
  } } onLogout={function (): void {
      throw new Error('Function not implemented.')
  } } />
}