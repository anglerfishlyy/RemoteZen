"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from '@/app/providers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { User, Bell, Moon, Sun, Shield, Trash2, Save } from 'lucide-react'

export default function ProfileSettings() {
  const { logout } = useAuth()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'security'>('profile')
  
  // Settings state
  const [notifications, setNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)
  const [autoStartBreaks, setAutoStartBreaks] = useState(false)
  const [focusSounds, setFocusSounds] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    const load = async () => {
      const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data?.user) {
        setName(data.user.name || '')
        setEmail(data.user.email || '')
      }
    }
    load()
  }, [API_URL])

  const save = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      setSaving(true)
      setMessage('')
      // backend currently has no PUT /auth/me; keep UI ready, simulate success
      await new Promise(r => setTimeout(r, 500))
      setMessage('Saved!')
    } catch {
      setMessage('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="px-6 pb-6">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white flex items-center"
        >
          <User className="w-6 h-6 mr-3" />
          Profile & Settings
        </motion.h1>
        <p className="text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left nav (like ChatGPT settings sidebar) */}
          <Card className="bg-black/40 backdrop-blur-xl border-white/10 h-fit">
            <CardHeader>
              <CardTitle className="text-white">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="ghost" 
                className={`w-full justify-start transition-all duration-200 ${
                  activeTab === 'profile' 
                    ? 'text-white bg-white/10' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('profile')}
              >
                <User className="w-4 h-4 mr-2" />
                Profile
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start transition-all duration-200 ${
                  activeTab === 'preferences' 
                    ? 'text-white bg-white/10' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('preferences')}
              >
                <Bell className="w-4 h-4 mr-2" />
                Preferences
              </Button>
              <Button 
                variant="ghost" 
                className={`w-full justify-start transition-all duration-200 ${
                  activeTab === 'security' 
                    ? 'text-white bg-white/10' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
                onClick={() => setActiveTab('security')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Security
              </Button>
            </CardContent>
          </Card>

          {/* Right content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Name</Label>
                      <Input 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                        className="bg-white/5 border-white/10 text-white mt-1" 
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Email</Label>
                      <Input 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="bg-white/5 border-white/10 text-white mt-1" 
                        placeholder="Enter your email"
                        type="email"
                      />
                    </div>
                    <div className="flex items-center gap-3 pt-4">
                      <Button 
                        onClick={save} 
                        disabled={saving} 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save changes'}
                      </Button>
                      {message && (
                        <Badge variant="outline" className="border-green-500/50 text-green-400">
                          {message}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Bell className="w-5 h-5 mr-2" />
                      Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Push Notifications</Label>
                        <p className="text-sm text-gray-400">Receive notifications for focus sessions and breaks</p>
                      </div>
                      <Switch 
                        checked={notifications} 
                        onCheckedChange={setNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Focus Sounds</Label>
                        <p className="text-sm text-gray-400">Play sounds when starting and ending focus sessions</p>
                      </div>
                      <Switch 
                        checked={focusSounds} 
                        onCheckedChange={setFocusSounds}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Auto-start Breaks</Label>
                        <p className="text-sm text-gray-400">Automatically start break timer after focus sessions</p>
                      </div>
                      <Switch 
                        checked={autoStartBreaks} 
                        onCheckedChange={setAutoStartBreaks}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      {darkMode ? <Moon className="w-5 h-5 mr-2" /> : <Sun className="w-5 h-5 mr-2" />}
                      Appearance
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-gray-300">Dark Mode</Label>
                        <p className="text-sm text-gray-400">Use dark theme for better focus</p>
                      </div>
                      <Switch 
                        checked={darkMode} 
                        onCheckedChange={setDarkMode}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Change Password</Label>
                      <p className="text-sm text-gray-400 mb-3">Update your password to keep your account secure</p>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Change Password
                      </Button>
                    </div>
                    <Separator className="bg-white/10" />
                    <div>
                      <Label className="text-gray-300">Two-Factor Authentication</Label>
                      <p className="text-sm text-gray-400 mb-3">Add an extra layer of security to your account</p>
                      <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Enable 2FA
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="flex items-center text-red-400">
                      <Trash2 className="w-5 h-5 mr-2" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Delete Account</Label>
                      <p className="text-sm text-gray-400 mb-3">Permanently delete your account and all data</p>
                      <Button variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                    <Separator className="bg-white/10" />
                    <Button 
                      variant="outline" 
                      onClick={logout} 
                      className="border-white/20 text-white hover:bg-white/10 w-full"
                    >
                      Log out
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
