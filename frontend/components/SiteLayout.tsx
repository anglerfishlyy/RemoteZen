"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { AuthGuard } from './AuthGuard';
import FeedbackButton from './FeedbackButton';

const SHELL_PAGES = new Set(['/dashboard', '/tasks', '/timer', '/analytics', '/teams', '/profile', '/notifications']);
const HEADER_PAGES = new Set(['/dashboard', '/tasks', '/timer', '/analytics', '/teams', '/profile', '/notifications']); // Pages where header should appear

type NavigateFunction = (page: 'landing' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'analytics' | 'profile' | 'teams' | 'notifications') => void;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fix: Detect mobile screen size and handle sidebar state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setSidebarOpen(false); // Close mobile sidebar when switching to desktop
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const inShell = useMemo(() => {
    if (!pathname) return false;
    return Array.from(SHELL_PAGES).some(base => pathname === base || pathname.startsWith(base + '/'));
  }, [pathname]);

  const showHeader = useMemo(() => {
    if (!pathname) return false;
    return Array.from(HEADER_PAGES).some(base => pathname === base || pathname.startsWith(base + '/'));
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
    // Public pages (landing, login, etc.) - no header
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
        <main className="pt-16">{children}</main>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
        {showHeader && (
          <Header
            currentPage={pathname || ''}
            onNavigate={handleNavigate}
            onLogout={() => router.push('/login')}
            onToggleSidebar={() => {
              if (isMobile) {
                setSidebarOpen(v => !v);
              } else {
                setSidebarCollapsed(v => !v);
              }
            }}
          />
        )}
        <div className="flex relative">
          {/* Fix: Mobile sidebar overlay */}
          {isMobile && sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Fix: Sidebar - hidden on mobile when closed, always visible on desktop */}
          <div className={`
            ${isMobile 
              ? `fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] transform transition-transform duration-300 ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : 'relative'
            }
          `}>
            <Sidebar 
              currentPage={pathname || ''} 
              onNavigate={(page) => {
                handleNavigate(page);
                if (isMobile) setSidebarOpen(false); // Close mobile sidebar on navigation
              }} 
              collapsed={!isMobile && sidebarCollapsed}
            />
          </div>
          
          {/* Fix: Main content - responsive padding */}
          <main className={`
            flex-1 pt-16 transition-all duration-300
            ${isMobile 
              ? 'w-full px-4 pb-6' 
              : `${sidebarCollapsed ? 'pl-20' : 'pl-64'} pr-6`
            }
          `}>
            {children}
          </main>
        </div>
        <FeedbackButton />
      </div>
    </AuthGuard>
  );
}
