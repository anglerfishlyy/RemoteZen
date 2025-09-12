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

export function Providers({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
        console.error('Token validation failed:', err)
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

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')

      localStorage.setItem('token', data.token)
      setIsAuthenticated(true)
      setUser(data.user)
    } catch (err) {
      console.error('Login error:', err)
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

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Signup failed')

      // Save token and set user directly
      localStorage.setItem('token', data.token)
      setIsAuthenticated(true)
      setUser(data.user)
    } catch (err) {
      console.error('Signup error:', err)
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
      {children}
    </AuthContext.Provider>
  )
}
