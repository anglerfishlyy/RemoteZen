import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import { AuthGuard } from '@/components/AuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
        <Header currentPage={''} onNavigate={function (page: 'landing' | 'auth' | 'dashboard' | 'tasks' | 'timer' | 'profile'): void {
                  throw new Error('Function not implemented.')
              } } onLogout={function (): void {
                  throw new Error('Function not implemented.')
              } } />
        <div className="flex">
          <Sidebar currentPage={''} onNavigate={function (page: 'landing' | 'auth' | 'dashboard' | 'tasks' | 'timer' | 'profile'): void {
                      throw new Error('Function not implemented.')
                  } } />
          <main className="flex-1 pt-16">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  )
}