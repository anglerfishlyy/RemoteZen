"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Progress } from "./ui/progress"
import Sidebar from "./Sidebar"
import { ImageWithFallback } from "./ImageWithFallback"
import {
  Play,
  Pause,
  RotateCcw,
  Timer,
  Target,
  Clock,
  Zap,
  CheckSquare,
  Plus,
  Settings,
  TrendingUp,
  Users,
  Coffee,
} from "lucide-react"

type NavigateFunction = (
  page: "landing" |"analytics" | "login" | "dashboard" | "tasks" | "timer" | "profile"
) => void;

interface TimerPageProps {
  onNavigate: NavigateFunction
  onLogout: () => void
}

export default function TimerPage({ onNavigate, onLogout }: TimerPageProps) {
  const [selectedTask, setSelectedTask] = useState<string>("")
  const [currentTime, setCurrentTime] = useState(25 * 60) // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<"focus" | "break">("focus")
  const [sessionsCompleted, setSessionsCompleted] = useState(0)

  const focusTime = 25 * 60
  const breakTime = 5 * 60

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime((time) => time - 1)
      }, 1000)
    } else if (currentTime === 0) {
      setIsRunning(false)
      if (mode === "focus") {
        setSessionsCompleted((prev) => prev + 1)
        setMode("break")
        setCurrentTime(breakTime)
      } else {
        setMode("focus")
        setCurrentTime(focusTime)
      }
    }

    return () => clearInterval(interval)
  }, [isRunning, currentTime, mode, focusTime, breakTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalTime = mode === "focus" ? focusTime : breakTime
    return ((totalTime - currentTime) / totalTime) * 100
  }

  const handleStart = () => setIsRunning(true)
  const handlePause = () => setIsRunning(false)
  const handleReset = () => {
    setIsRunning(false)
    setCurrentTime(mode === "focus" ? focusTime : breakTime)
  }

  const tasks = [
    { id: '1', title: 'Design new landing page', status: 'in-progress' },
    { id: '2', title: 'Fix authentication bug', status: 'in-progress' },
    { id: '3', title: 'Update API documentation', status: 'pending' },
    { id: '4', title: 'Review code changes', status: 'pending' }
  ];

  const activeTimers = [
    {
      user: { name: 'Sarah Martinez', avatar: 'SM' },
      task: 'API Review & Testing',
      time: '23:45',
      status: 'focus'
    },
    {
      user: { name: 'Mike Rodriguez', avatar: 'MR' },
      task: 'Bug Fix Implementation',
      time: '18:20',
      status: 'focus'
    },
    {
      user: { name: 'David Kim', avatar: 'DK' },
      task: 'UI Component Updates',
      time: '04:15',
      status: 'break'
    }
  ];

  const todayStats = {
    focusTime: '4h 32m',
    sessions: 8,
    tasksCompleted: 3,
    productivity: 94
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
      <Sidebar currentPage="timer" onNavigate={onNavigate} onLogout={onLogout} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-bold text-white"
              >
                Focus Timer
              </motion.h1>
              <p className="text-gray-400 mt-1">Stay focused and track your productivity with Pomodoro technique.</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onNavigate('tasks')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
            {/* Timer Section */}
            <div className="lg:col-span-2 space-y-6">
              {/* Task Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Select Task to Focus On
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Choose a task to track your focus time
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedTask} onValueChange={setSelectedTask}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Choose a task or start without one" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/90 border-white/10">
                        <SelectItem value="no">No specific task</SelectItem>
                        {tasks.map((task) => (
                          <SelectItem key={task.id} value={task.id}>
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main Timer */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="mb-6">
                        <Badge 
                          className={`text-sm px-3 py-1 ${
                            mode === 'focus' 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                              : 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                          }`}
                        >
                          {mode === 'focus' ? (
                            <>
                              <Zap className="w-4 h-4 mr-1" />
                              Focus Time
                            </>
                          ) : (
                            <>
                              <Coffee className="w-4 h-4 mr-1" />
                              Break Time
                            </>
                          )}
                        </Badge>
                      </div>

                      {/* Circular Timer */}
                      <div className="relative w-80 h-80 mx-auto mb-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
                        <div className="relative w-full h-full rounded-full border-8 border-white/10 flex items-center justify-center">
                          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-white/10"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              stroke="url(#gradient)"
                              strokeWidth="8"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray="283"
                              strokeDashoffset={283 - (getProgress() / 100) * 283}
                              className="transition-all duration-1000 ease-linear"
                            />
                            <defs>
                              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#3B82F6" />
                                <stop offset="100%" stopColor="#8B5CF6" />
                              </linearGradient>
                            </defs>
                          </svg>
                          
                          <div className="text-center">
                            <div className="text-6xl font-bold text-white mb-2">
                              {formatTime(currentTime)}
                            </div>
                            <div className="text-gray-400">
                              {selectedTask ? tasks.find(t => t.id === selectedTask)?.title || 'Custom Focus Session' : 'Focus Session'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timer Controls */}
                      <div className="flex items-center justify-center space-x-4">
                        {!isRunning ? (
                          <Button
                            size="lg"
                            onClick={handleStart}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8"
                          >
                            <Play className="w-6 h-6 mr-2" />
                            Start Focus
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            onClick={handlePause}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 px-8"
                          >
                            <Pause className="w-6 h-6 mr-2" />
                            Pause
                          </Button>
                        )}
                        
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={handleReset}
                          className="border-white/20 text-white hover:bg-white/10"
                        >
                          <RotateCcw className="w-6 h-6" />
                        </Button>
                      </div>

                      {/* Session Counter */}
                      <div className="mt-8 flex items-center justify-center space-x-6 text-gray-400">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{sessionsCompleted}</div>
                          <div className="text-sm">Sessions Today</div>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">25m</div>
                          <div className="text-sm">Focus Duration</div>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">5m</div>
                          <div className="text-sm">Break Duration</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Inspirational Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative h-48">
                      <ImageWithFallback
                        src="https://images.unsplash.com/photo-1660810731526-0720827cbd38?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxmb2N1cyUyMHRpbWVyJTIwcHJvZHVjdGl2aXR5fGVufDF8fHx8MTc1NzMxNTMyNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                        alt="Focus and productivity"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                        <div className="p-6 text-white">
                          <h3 className="text-lg font-medium mb-1">Deep Work Mode</h3>
                          <p className="text-gray-200 text-sm">Focus on what matters most and achieve your goals.</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Today's Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      Today's Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300">Focus Time</span>
                      </div>
                      <span className="text-white font-medium">{todayStats.focusTime}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Timer className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">Sessions</span>
                      </div>
                      <span className="text-white font-medium">{todayStats.sessions}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckSquare className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">Completed</span>
                      </div>
                      <span className="text-white font-medium">{todayStats.tasksCompleted}</span>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Productivity Score</span>
                        <span className="text-sm font-medium text-white">{todayStats.productivity}%</span>
                      </div>
                      <Progress value={todayStats.productivity} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Active Team Timers */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Team Focus Sessions
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      See who's currently focused
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeTimers.map((timer, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white text-sm">
                              {timer.user.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                            timer.status === 'focus' ? 'bg-blue-400' : 'bg-green-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{timer.user.name}</p>
                          <p className="text-gray-400 text-xs truncate">{timer.task}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-mono">{timer.time}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              timer.status === 'focus' 
                                ? 'border-blue-500/50 text-blue-400' 
                                : 'border-green-500/50 text-green-400'
                            }`}
                          >
                            {timer.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                      onClick={() => onNavigate('tasks')}
                    >
                      <CheckSquare className="w-4 h-4 mr-3" />
                      View All Tasks
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                      onClick={() => onNavigate('dashboard')}
                    >
                      <TrendingUp className="w-4 h-4 mr-3" />
                      View Analytics
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Timer Settings
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
