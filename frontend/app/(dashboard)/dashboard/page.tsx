"use client"

import Dashboard from '../../../components/Dashboard'

export default function DashboardPage() {
  return <Dashboard onNavigate={function (page: 'landing' | 'auth' | 'dashboard' | 'tasks' | 'timer' | 'profile'): void {
      throw new Error('Function not implemented.')
  } } onLogout={function (): void {
      throw new Error('Function not implemented.')
  } } />
}