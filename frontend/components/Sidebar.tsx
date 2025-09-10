"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  BarChart3, 
  CheckSquare, 
  Timer, 
  User, 
  Settings,
  Bell,
  Zap,
  Users,
  Calendar,
  FileText,
  ChevronRight,
  TrendingUp
} from 'lucide-react'

const navigationItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    page: 'dashboard',
    icon: BarChart3,
    badge: null
  },
  {
    title: 'Tasks',
    href: '/tasks',
    page: 'tasks',
    icon: CheckSquare,
    badge: '12'
  },
  {
    title: 'Focus Timer',
    href: '/timer',
    page: 'timer',
    icon: Timer,
    badge: null
  },
  {
    title: 'Analytics',
    href: '/analytics',
    page: 'analytics',
    icon: TrendingUp,
    badge: null
  },
  {
    title: 'Team',
    href: '/team',
    page: 'team',
    icon: Users,
    badge: null
  },
  {
    title: 'Calendar',
    href: '/calendar',
    page: 'calendar',
    icon: Calendar,
    badge: '3'
  },
  {
    title: 'Documents',
    href: '/documents',
    page: 'documents',
    icon: FileText,
    badge: null
  }
]

const quickActions = [
  {
    title: 'Quick Task',
    icon: Zap,
    action: () => console.log('Quick task')
  },
  {
    title: 'Start Timer',
    icon: Timer,
    action: () => console.log('Start timer')
  }
]

// Updated to match your main App component's type
type NavigateFunction = (page: 'landing' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'analytics' | 'profile') => void;

interface SidebarProps {
  currentPage: string;
  onNavigate: NavigateFunction;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  console.log('Sidebar rendered with currentPage:', currentPage); // Debug log

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-black/20 backdrop-blur-xl border-r border-white/10 overflow-y-auto">
      <div className="p-6">
        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item, index) => {
            const isActive = currentPage === item.page
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="ghost"
                  className={`w-full justify-start text-left h-auto p-3 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => {
                    console.log('Sidebar navigation clicked:', item.page); // Debug log
                    if (typeof onNavigate === 'function') {
                      onNavigate(item.page as any);
                    } else {
                      console.error('onNavigate is not a function in Sidebar');
                    }
                  }}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="flex-1">{item.title}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-0">
                      {item.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <ChevronRight className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </motion.div>
            )
          })}
        </nav>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-400 mb-3 px-3">Quick Actions</h3>
          <div className="space-y-2">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (navigationItems.length + index) * 0.1 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                  onClick={action.action}
                >
                  <action.icon className="w-4 h-4 mr-3" />
                  {action.title}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Productivity Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10"
        >
          <h3 className="text-sm font-medium text-white mb-3">Today's Focus</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Tasks completed</span>
              <span className="text-sm text-white font-medium">8/12</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full w-2/3"></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Focus time</span>
              <span className="text-sm text-white font-medium">2h 45m</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom Actions */}
        <div className="mt-8 space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
            onClick={() => {
              console.log('Profile navigation clicked'); // Debug log
              if (typeof onNavigate === 'function') {
                onNavigate('profile');
              } else {
                console.error('onNavigate is not a function in Sidebar');
              }
            }}
          >
            <User className="w-4 h-4 mr-3" />
            Profile
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
          >
            <Settings className="w-4 h-4 mr-3" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 relative"
          >
            <Bell className="w-4 h-4 mr-3" />
            Notifications
            <Badge className="absolute top-1 right-1 w-2 h-2 p-0 bg-red-500 border-0" />
          </Button>
        </div>
      </div>
    </aside>
  )
}