"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { AuthGuard } from '@/components/AuthGuard';

type NavigateFunction = (page: 'landing' | 'auth' | 'dashboard' | 'tasks' | 'timer' | 'profile') => void;

interface DashboardLayoutProps {
  children: React.ReactNode; // Next.js layouts only receive children
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  // Function to determine current page from pathname
  const getCurrentPage = () => {
    const path = pathname.split('/').pop() || 'dashboard';
    console.log('Current pathname:', pathname, 'Detected page:', path);
    return path;
  };

  const [currentPage, setCurrentPage] = useState(getCurrentPage());

  // Update currentPage when pathname changes
  useEffect(() => {
    const newPage = getCurrentPage();
    setCurrentPage(newPage);
    console.log('Page changed to:', newPage);
  }, [pathname]);

  // Navigation handler
  const handleNavigate: NavigateFunction = (page) => {
    console.log('Navigating to:', page);
    setCurrentPage(page);
    
    // Handle different page routes
    switch (page) {
      case 'landing':
        router.push('/');
        break;
      case 'auth':
        router.push('/auth');
        break;
      case 'dashboard':
        router.push('/dashboard');
        break;
      case 'tasks':
        router.push('/tasks');
        break;
      case 'timer':
        router.push('/timer');
        break;
      case 'profile':
        router.push('/profile');
        break;
      default:
        router.push(`/${page}`);
    }
  };

  // Logout handler
  const handleLogout = () => {
    console.log('Logout called');
    // Add your logout logic here (clear tokens, etc.)
    router.push('/auth');
  };

  console.log('DashboardLayout rendering with currentPage:', currentPage);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
        <Header 
          currentPage={currentPage} 
          onNavigate={handleNavigate} 
          onLogout={handleLogout} 
        />
        <div className="flex">
          <Sidebar 
            currentPage={currentPage} 
            onNavigate={handleNavigate} 
          />
          <main className="flex-1 pt-16">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}