import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { AuthGuard } from '@/components/AuthGuard'

type NavigateFunction = (page: 'landing' | 'auth' | 'dashboard' | 'tasks' | 'timer' | 'profile') => void

interface DashboardLayoutProps {
  children: React.ReactNode
  onNavigate: NavigateFunction
  onLogout: () => void
}

export default function DashboardLayout({ children, onNavigate, onLogout }: DashboardLayoutProps) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
        <Header currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex">
          <Sidebar currentPage="dashboard" onNavigate={onNavigate} />
          <main className="flex-1 pt-16">{children}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
