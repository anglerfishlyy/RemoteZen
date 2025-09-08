"use client"

import React from 'react'
import { motion } from "framer-motion"
import { Button } from './ui/button'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Badge } from './ui/badge'
import {
  BarChart3,
  CheckSquare,
  Timer,
  User,
  LogOut,
  Settings,
  Bell,
  Search,
} from 'lucide-react'

type NavigateFunction = (page: 'landing' | 'auth' | 'dashboard' | 'tasks' | 'timer' | 'profile') => void;

interface HeaderProps {
  currentPage: string;
  onNavigate: NavigateFunction;
  onLogout: () => void;
}

export default function Header({ currentPage, onNavigate, onLogout }: HeaderProps) {

  return (
    <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
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

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              className={`text-white hover:bg-white/10 ${
                currentPage === 'dashboard' ? 'bg-white/10' : ''
              }`}
              onClick={() => onNavigate('dashboard')}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant="ghost"
              className={`text-white hover:bg-white/10 ${
                currentPage === 'tasks' ? 'bg-white/10' : ''
              }`}
              onClick={() => onNavigate('tasks')}
            >
              <CheckSquare className="w-4 h-4 mr-2" />
              Tasks
            </Button>
            <Button
              variant="ghost"
              className={`text-white hover:bg-white/10 ${
                currentPage === 'timer' ? 'bg-white/10' : ''
              }`}
              onClick={() => onNavigate('timer')}
            >
              <Timer className="w-4 h-4 mr-2" />
              Focus Timer
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
                    <AvatarImage src="/avatar.png" alt="User" />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      JD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-black/90 backdrop-blur-xl border-white/10" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="text-sm font-medium text-white">
                      John Doe
                    </p>
                    <p className="text-xs text-gray-400">
                      john@example.com
                    </p>
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
  )
}