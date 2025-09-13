"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from './ui/button'
import { useAuth, useNotifications } from '@/app/providers'
import { PRODUCTIVITY_CONFIG } from '@/lib/config'
import { Badge } from './ui/badge'
import QuickTaskModal from './QuickTaskModal'
import QuickTimerModal from './QuickTimerModal'
import { 
  BarChart3, 
  CheckSquare, 
  Timer, 
  User, 
  Bell,
  Zap,
  ChevronRight,
  TrendingUp
} from 'lucide-react'

const navigationItems = [
  { title: 'Overview', href: '/dashboard', page: 'dashboard', icon: BarChart3, badge: null },
  { title: 'Tasks', href: '/tasks', page: 'tasks', icon: CheckSquare, badge: null },
  { title: 'Focus Timer', href: '/timer', page: 'timer', icon: Timer, badge: null },
  { title: 'Analytics', href: '/analytics', page: 'analytics', icon: TrendingUp, badge: null },
]

// Quick actions will be defined in the component to access state

// Updated to match your main App component's type
type NavigateFunction = (page: 'landing' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'analytics' | 'profile' | 'teams' | 'notifications') => void;

interface SidebarProps {
  currentPage: string;
  onNavigate: NavigateFunction;
  collapsed?: boolean;
}

export default function Sidebar({ currentPage, onNavigate, collapsed = false }: SidebarProps) {
  const { user } = useAuth()
  const { unreadCount } = useNotifications()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const [, setTeamId] = useState<string>('')
  const [todayFocusMin, setTodayFocusMin] = useState<number>(0)
  const [tasksCompleted, setTasksCompleted] = useState<number>(0)
  
  // Modal states
  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false)
  const [isQuickTimerOpen, setIsQuickTimerOpen] = useState(false)

  const quickActions = [
    {
      title: 'Quick Task',
      icon: Zap,
      action: () => setIsQuickTaskOpen(true)
    },
    {
      title: 'Start Timer',
      icon: Timer,
      action: () => setIsQuickTimerOpen(true)
    }
  ]

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !user) return
    const load = async () => {
      try {
        const meRes = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        const me = await meRes.json()
        const t = me?.teams?.[0]
        if (!t) return
        setTeamId(t.id)

        const today = new Date()
        const from = new Date(today.getFullYear(), today.getMonth(), today.getDate())
        const to = new Date(from.getTime() + 24*60*60*1000)
        const aRes = await fetch(`${API_URL}/analytics/productivity?teamId=${t.id}&from=${from.toISOString()}&to=${to.toISOString()}`, { headers: { Authorization: `Bearer ${token}` } })
        if (aRes.ok) {
          const a = await aRes.json()
          setTodayFocusMin(Math.floor((a?.totalFocusSeconds || 0)/60))
          setTasksCompleted(a?.tasksCompleted || 0)
        }
      } catch (e) { console.error(e) }
    }
    load()
  }, [API_URL, user])

  return (
    <aside className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] ${collapsed ? 'w-16' : 'w-64'} bg-black/40 backdrop-blur-xl border-r border-white/30 overflow-y-auto custom-scrollbar transition-all duration-300`}>
      <div className={`p-6 ${collapsed ? 'px-3' : ''}`}>
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
                  className={`w-full justify-start text-left h-auto p-3 transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-r from-blue-500/40 to-purple-500/40 text-white border border-blue-500/60 shadow-lg shadow-blue-500/30 rounded-lg' 
                      : 'text-gray-300 hover:text-white hover:bg-white/20 rounded-lg'
                  }`}
                  onClick={() => {
                    if (typeof onNavigate === 'function') {
                      onNavigate(item.page as 'dashboard' | 'tasks' | 'timer' | 'analytics' | 'profile' | 'teams' | 'landing' | 'login' | 'notifications');
                    }
                  }}
                >
                  <item.icon className={`w-5 h-5 ${collapsed ? '' : 'mr-3'}`} />
                  {!collapsed && <span className="flex-1">{item.title}</span>}
                  {!collapsed && item.badge && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-0">
                      {item.badge}
                    </Badge>
                  )}
                  {!collapsed && isActive && (
                    <ChevronRight className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </motion.div>
            )
          })}
        </nav>

        {!collapsed && (
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
        )}

        {/* Productivity Stats */}
        {!collapsed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-white/10"
        >
          <h3 className="text-sm font-medium text-white mb-3">Today&rsquo;s Focus</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Tasks completed</span>
              <span className="text-sm text-white font-medium">{tasksCompleted}</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: `${Math.min(100, (todayFocusMin/(PRODUCTIVITY_CONFIG.DAILY_FOCUS_TARGET/60))*100)}%` }}></div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Focus time</span>
              <span className="text-sm text-white font-medium">{Math.floor(todayFocusMin/60)}h {todayFocusMin%60}m</span>
            </div>
          </div>
        </motion.div>
        )}

        {/* Bottom Actions */}
        <div className="mt-8 space-y-2">
          <Button
            variant="ghost"
            className={`w-full justify-start text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 rounded-lg ${collapsed ? 'px-2' : ''}`}
            onClick={() => onNavigate('profile')}
          >
            <User className={`w-4 h-4 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && 'Profile'}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-300 relative rounded-lg ${collapsed ? 'px-2' : ''}`}
            onClick={() => onNavigate('notifications')}
          >
            <Bell className={`w-4 h-4 ${collapsed ? '' : 'mr-3'}`} />
            {!collapsed && 'Notifications'}
            {unreadCount > 0 && (
              <Badge className="absolute top-1 right-1 w-5 h-5 p-0 bg-red-500 border-0 text-[10px] flex items-center justify-center">{unreadCount}</Badge>
            )}
          </Button>
        </div>
      </div>
      
      {/* Modals */}
      <QuickTaskModal 
        isOpen={isQuickTaskOpen} 
        onClose={() => setIsQuickTaskOpen(false)} 
      />
      <QuickTimerModal 
        isOpen={isQuickTimerOpen} 
        onClose={() => setIsQuickTimerOpen(false)} 
      />
    </aside>
  )
}