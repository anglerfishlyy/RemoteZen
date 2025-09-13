'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function normalizeBaseUrl(url: string): string {
  if (!url) return 'http://localhost:5000'
  // Add scheme if missing
  if (!/^https?:\/\//i.test(url)) {
    return `http://${url}`
  }
  // Trim trailing slash
  return url.replace(/\/$/, '')
}

export function Providers({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const API_URL = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000')

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    const validateToken = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()
        if (res.ok && data.user) {
          setIsAuthenticated(true)
          setUser(data.user)
        } else {
          logout()
        }
      } catch (err) {
        console.error('Token validation failed:', err, 'Base URL:', API_URL)
        logout()
      }
    }

    validateToken()
  }, [API_URL])

  // Login
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Login failed')

      localStorage.setItem('token', data.token)
      setIsAuthenticated(true)
      setUser(data.user)
    } catch (err) {
      console.error('Login error:', err, 'Base URL:', API_URL)
      throw err
    }
  }

  // Signup
  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Signup failed')

      // Save token and set user directly
      localStorage.setItem('token', data.token)
      setIsAuthenticated(true)
      setUser(data.user)
    } catch (err) {
      console.error('Signup error:', err, 'Base URL:', API_URL)
      throw err
    }
  }

  // Logout
  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
      <NotificationsProvider>
        {children}
      </NotificationsProvider>
    </AuthContext.Provider>
  )
}

// Notifications context
type AppNotification = { id: string; title: string; body?: string; createdAt: number; read?: boolean }

interface NotificationsContextType {
  notifications: AppNotification[]
  unreadCount: number
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => void
  markAllRead: () => void
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined)

export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}

function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }, [])

  const addNotification: NotificationsContextType['addNotification'] = ({ title, body }) => {
    const entry: AppNotification = { id: crypto.randomUUID(), title, body, createdAt: Date.now(), read: false }
    setNotifications(prev => [entry, ...prev].slice(0, 100))
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body })
      }
    } catch {}
  }

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  const unreadCount = notifications.reduce((acc, n) => acc + (n.read ? 0 : 1), 0)

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, addNotification, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  )
}
