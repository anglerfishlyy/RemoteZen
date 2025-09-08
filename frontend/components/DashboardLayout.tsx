import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

type NavigateFunction = (page: 'landing' | 'auth' | 'dashboard' | 'tasks' | 'timer' | 'profile') => void;

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: NavigateFunction;
  onLogout: () => void;
}

export default function DashboardLayout({ children, currentPage, onNavigate, onLogout }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
      <Header currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      <div className="flex">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        <main className="flex-1 pt-16 ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}