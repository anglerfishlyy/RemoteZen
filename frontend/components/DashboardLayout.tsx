"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import { Providers } from '@/app/providers';
import { AuthGuard } from './AuthGuard';

type NavigateFunction = (page: 'landing' |'analytics' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'profile') => void;

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: 'landing' |'analytics' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'profile';
}

export default function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const router = useRouter();

  const handleNavigate: NavigateFunction = (page) => {
    switch(page) {
      case 'landing':
        router.push('/');
        break;
      case 'login':
        router.push('/login');
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
      case 'analytics':
        router.push('/analytics');
        break;
      case 'profile':
        router.push('/profile');
        break;
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    router.push('/login');
  };

  return (
    <AuthGuard>
      <Providers>
        <div className="min-h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
          <Header currentPage={currentPage} onNavigate={handleNavigate} onLogout={handleLogout} />
          <div className="flex">
            <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
            <main className="flex-1 pt-16 ml-64">
              {children}
            </main>
          </div>
        </div>
      </Providers>
    </AuthGuard>
  );
}
