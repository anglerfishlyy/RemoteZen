"use client"

import ProfilePage from '../../../components/ProfilePage'

export default function Profile() {
  return <ProfilePage onNavigate={function (page: 'landing' | 'auth' | 'dashboard' | 'tasks' | 'timer' | 'profile'): void {
      throw new Error('Function not implemented.')
  } } onLogout={function (): void {
      throw new Error('Function not implemented.')
  } } />
}