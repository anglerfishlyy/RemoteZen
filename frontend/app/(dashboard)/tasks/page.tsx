"use client"

import TasksPage from '@/components/TasksPage'

export default function Tasks() {
  return <TasksPage onNavigate={function (page: 'landing' | 'auth' | 'dashboard' | 'tasks' | 'timer' | 'profile'): void {
      throw new Error('Function not implemented.')
  } } onLogout={function (): void {
      throw new Error('Function not implemented.')
  } } />
}