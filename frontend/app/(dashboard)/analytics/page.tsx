"use client"

import AnalyticsPage from '@/components/AnalyticsPage'

export default function Timer() {
  return <AnalyticsPage onNavigate={function (page: 'landing' | 'analytics'| 'auth' | 'dashboard' | 'tasks' | 'timer' | 'profile'): void {
      throw new Error('Function not implemented.')
  } } onLogout={function (): void {
      throw new Error('Function not implemented.')
  } } />
}