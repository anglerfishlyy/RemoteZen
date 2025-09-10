"use client"

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LandingPage from '../components/LandingPage';
import AuthPage from '../components/AuthPage';
import Dashboard from '../components/Dashboard';
import TasksPage from '../components/TasksPage';
import TimerPage from '../components/TimerPage';
import ProfilePage from '../components/ProfilePage';
import AnalyticsPage from '../components/AnalyticsPage';

type Page = 'landing' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'analytics' | 'profile';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleAuth = () => {
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.4
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="min-h-screen"
        >
          {currentPage === 'landing' && (
            <LandingPage onNavigate={navigate} />
          )}
          {currentPage === 'login' && (
            <AuthPage onAuth={handleAuth} onNavigate={navigate} />
          )}
          {currentPage === 'dashboard' && isAuthenticated && (
            <Dashboard onNavigate={navigate} onLogout={handleLogout} />
          )}
          {currentPage === 'tasks' && isAuthenticated && (
            <TasksPage onNavigate={navigate} onLogout={handleLogout} />
          )}
          {currentPage === 'timer' && isAuthenticated && (
            <TimerPage onNavigate={navigate} onLogout={handleLogout} />
          )}
          {currentPage === 'analytics' && isAuthenticated && (
            <AnalyticsPage onNavigate={navigate} onLogout={handleLogout} />
          )}
          {currentPage === 'profile' && isAuthenticated && (
            <ProfilePage onNavigate={navigate} onLogout={handleLogout} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}