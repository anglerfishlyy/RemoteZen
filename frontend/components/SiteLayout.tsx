"use client";

import React, { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { AuthGuard } from './AuthGuard';
import FeedbackButton from './FeedbackButton';

// Pages within the dashboard shell
const SHELL_PAGES = new Set(['/dashboard', '/tasks', '/timer', '/analytics', '/teams', '/profile', '/notifications']);

type NavigateFunction = (page: 'landing' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'analytics' | 'profile' | 'teams' | 'notifications') => void;

export default function SiteLayout({ children }: { children: React.ReactNode }){
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const inShell = useMemo(() => {
    // consider dynamic child paths as inside shell as well
    if (!pathname) return false;
    return Array.from(SHELL_PAGES).some(base => pathname === base || pathname.startsWith(base + '/'));
  }, [pathname]);

  const handleNavigate: NavigateFunction = (page) => {
    switch(page) {
      case 'landing': router.push('/'); break;
      case 'login': router.push('/login'); break;
      case 'dashboard': router.push('/dashboard'); break;
      case 'tasks': router.push('/tasks'); break;
      case 'timer': router.push('/timer'); break;
      case 'analytics': router.push('/analytics'); break;
      case 'profile': router.push('/profile'); break;
      case 'teams': router.push('/teams'); break;
      case 'notifications': router.push('/notifications'); break;
    }
  };

  if (!inShell) {
    // Public pages use only the header without sidebar
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
        <Header currentPage={pathname || ''} onNavigate={handleNavigate} onLogout={() => router.push('/login')} onToggleSidebar={undefined} />
        <main className="pt-16">{children}</main>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
        <Header currentPage={pathname || ''} onNavigate={handleNavigate} onLogout={() => router.push('/login')} onToggleSidebar={() => setSidebarCollapsed(v => !v)} />
        <div className="flex">
          <Sidebar currentPage={pathname || ''} onNavigate={handleNavigate} collapsed={sidebarCollapsed} />
          <main className={`flex-1 pt-16 transition-all duration-300 ${sidebarCollapsed ? 'pl-20' : 'pl-64'} pr-6`}>
            {children}
          </main>
        </div>
        <FeedbackButton />
      </div>
    </AuthGuard>
  );
}

