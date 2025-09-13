"use client";

import React from 'react';
import { motion } from "framer-motion";
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { useAuth } from '@/app/providers';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import {
  BarChart3,
  CheckSquare,
  Timer,
  User,
  LogOut,
  Settings,
  Bell,
  Search,
} from 'lucide-react';

type NavigateFunction = (page: 'landing' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'analytics' | 'profile') => void;

interface HeaderProps {
  currentPage: string;
  onNavigate: NavigateFunction;
  onLogout: () => void;
  onToggleSidebar?: () => void;
}

export default function Header({ currentPage, onNavigate, onLogout, onToggleSidebar }: HeaderProps) {
  const { user } = useAuth()
  const [hasTasks, setHasTasks] = useState(false)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  
  const initials = (user?.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0,2)
    .map(s => s[0]?.toUpperCase())
    .join('') || ''

  // Check if user has tasks available
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !user) return
    
    const checkTasks = async () => {
      try {
        const meRes = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        const me = await meRes.json()
        const firstTeam = me?.teams?.[0]
        if (!firstTeam) return
        
        const tRes = await fetch(`${API_URL}/tasks?teamId=${firstTeam.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const tData = await tRes.json()
        setHasTasks(Array.isArray(tData) && tData.length > 0)
      } catch (e) { 
        console.error(e)
        setHasTasks(false)
      }
    }
    checkTasks()
  }, [API_URL, user])
  return (
    <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Sidebar Toggle + Logo */}
          <div className="flex items-center gap-3">
            <button
              aria-label="Toggle sidebar"
              onClick={onToggleSidebar}
              className="w-8 h-8 rounded-md border border-white/10 hover:bg-white/10 cursor-pointer flex items-center justify-center"
            >
              <span className="sr-only">Toggle sidebar</span>
              {/* simple burger icon */}
              <div className="space-y-1">
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="w-4 h-0.5 bg-white"></div>
                <div className="w-4 h-0.5 bg-white"></div>
              </div>
            </button>
            <button 
              onClick={() => onNavigate('dashboard')} 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"
              >
                <BarChart3 className="w-5 h-5 text-white" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                RemoteZen
              </span>
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              className={`text-white hover:bg-white/10 transition-colors ${
                currentPage === 'dashboard' 
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
                  : ''
              }`}
              onClick={() => onNavigate('dashboard')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            
            <Button
              variant="ghost"
              className={`text-white hover:bg-white/10 transition-colors ${
                currentPage === 'tasks' 
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
                  : ''
              }`}
              onClick={() => onNavigate('tasks')}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks
            </Button>
            
            <Button
              variant="ghost"
              className={`text-white hover:bg-white/10 transition-colors ${
                currentPage === 'timer' 
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30' 
                  : ''
              }`}
              onClick={() => {
                if (!hasTasks) {
                  onNavigate('tasks')
                } else {
                  onNavigate('timer')
                }
              }}
            >
              <Timer className="w-4 h-4 mr-2" />
              {hasTasks ? 'Focus Timer' : 'Create Task First'}
            </Button>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Search className="w-4 h-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500 border-0" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {/* If you later add an avatar url to user, render AvatarImage here */}
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {initials || ''}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-xl border-white/10" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user ? (
                      <>
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </>
                    ) : (
                      <p className="text-sm text-gray-400">Not signed in</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="text-white hover:bg-white/10 cursor-pointer"
                  onClick={() => onNavigate('profile')}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white hover:bg-white/10 cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-red-500/10 cursor-pointer"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}