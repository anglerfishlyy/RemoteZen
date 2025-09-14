"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Avatar, AvatarFallback } from "./ui/avatar"
import { Progress } from "./ui/progress"
import { useAuth, useNotifications } from '@/app/providers'
import { TIMER_CONFIG } from '@/lib/config'
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

export default function TimerPage({ onNavigate, onLogout: _onLogout }: TimerPageProps) {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

  type ApiTask = { id: string; title: string }
  type FocusLog = { id: string; startTime: string; endTime?: string | null; duration?: number | null }
  type ActiveTimer = { id: string; startedAt: string; user: { id: string; name: string }; task: { id: string; title: string } }

  const [selectedTask, setSelectedTask] = useState<string>("")
  const [currentTime, setCurrentTime] = useState(TIMER_CONFIG.FOCUS_DURATION)
  const [isRunning, setIsRunning] = useState(false)
  const [mode, setMode] = useState<"focus" | "break">("focus")
  const [sessionsCompleted, setSessionsCompleted] = useState(0)
  const [teamId, setTeamId] = useState<string>('')
  const [tasks, setTasks] = useState<Array<{id: string; title: string}>>([])
  const [, setActiveLogId] = useState<string>('')
  const [currentTimerId, setCurrentTimerId] = useState<string>('')
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([])
  const [todayStats, setTodayStats] = useState({ focusTime: '0m', sessions: 0, tasksCompleted: 0, productivity: 0 })
  const [breakReminderTimeout, setBreakReminderTimeout] = useState<NodeJS.Timeout | null>(null)

  const focusTime = TIMER_CONFIG.FOCUS_DURATION
  const breakTime = TIMER_CONFIG.BREAK_DURATION

  // Timer effect - only runs when explicitly started by user
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime((time) => time - 1)
      }, 1000)
    } else if (currentTime === 0 && isRunning) {
      // Only auto-complete if timer was actually running (not just paused)
      setIsRunning(false)
      if (mode === "focus") {
        setSessionsCompleted((prev) => prev + 1)
        setMode("break")
        setCurrentTime(breakTime)
        // Trigger completion notification only when timer naturally completes
        addNotification({
          title: 'Focus Session Complete! 🎉',
          body: 'Great work! Take a 5-minute break to recharge.'
        })
        
        // Set break reminder after 5 minutes
        const timeout = setTimeout(() => {
          addNotification({
            title: 'Break\'s Over! ⏰',
            body: 'Time to get back to work. Start your next focus session.'
          })
        }, TIMER_CONFIG.BREAK_REMINDER_DELAY)
        setBreakReminderTimeout(timeout)
      } else {
        setMode("focus")
        setCurrentTime(focusTime)
      }
    }

    return () => clearInterval(interval)
  }, [isRunning, currentTime, mode, focusTime, breakTime, addNotification])

  // Load team, tasks, and current active focus log
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !user) return
    const load = async () => {
      try {
        const me = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        const data = (await me.json()) as { teams?: Array<{ id: string }> }
        const firstTeam = data.teams?.[0]
        if (firstTeam) {
          setTeamId(firstTeam.id)
          const taskRes = await fetch(`${API_URL}/tasks?teamId=${firstTeam.id}`, { headers: { Authorization: `Bearer ${token}` } })
          const taskData = (await taskRes.json()) as unknown
          const list = Array.isArray(taskData) ? (taskData as Array<Partial<ApiTask>>) : []
          setTasks(list.filter((t): t is ApiTask => Boolean(t?.id && t?.title)).map((t) => ({ id: t.id!, title: t.title! })))
        }

        const logsRes = await fetch(`${API_URL}/focus`, { headers: { Authorization: `Bearer ${token}` } })
        const logsRaw = (await logsRes.json()) as unknown
        const logs: Array<FocusLog> = Array.isArray(logsRaw)
          ? (logsRaw as Array<Partial<FocusLog>>).filter((l): l is FocusLog => typeof l?.id === 'string' && typeof l?.startTime === 'string')
          : []
        const active = logs.find((l) => !l.endTime)
        if (active) {
          setActiveLogId(active.id)
          // Don't auto-start the timer - let user manually start it
          // setIsRunning(true)
        }

        const today = new Date().toDateString()
        const todayLogs = logs.filter((l) => new Date(l.startTime).toDateString() === today)
        const totalSec = todayLogs.reduce((acc: number, l) => acc + (l.duration || 0), 0)
        const hours = Math.floor(totalSec / 3600)
        const mins = Math.floor((totalSec % 3600) / 60)
        setTodayStats({ focusTime: `${hours > 0 ? hours + 'h ' : ''}${mins}m`, sessions: todayLogs.length, tasksCompleted: 0, productivity: Math.min(100, Math.round((totalSec / (4 * 3600)) * 100)) })
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [API_URL, user])

  // Fetch active timers for team and keep in sync; also detect my active timer
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !teamId) return
    const fetchActive = async () => {
      try {
        const res = await fetch(`${API_URL}/focus/active?teamId=${teamId}`, { headers: { Authorization: `Bearer ${token}` } })
        const data = (await res.json()) as unknown
        const listRaw: Array<unknown> = Array.isArray(data) ? data as Array<unknown> : []
        const list: ActiveTimer[] = listRaw.filter((t: unknown): t is ActiveTimer => {
          if (typeof t !== 'object' || t === null) return false
          const v = t as { id?: unknown; startedAt?: unknown; user?: unknown; task?: unknown }
          const userVal = v.user as { id?: unknown; name?: unknown } | undefined
          const taskVal = v.task as { id?: unknown; title?: unknown } | undefined
          return (
            typeof v.id === 'string' &&
            typeof v.startedAt === 'string' &&
            !!userVal && typeof userVal.id === 'string' && typeof userVal.name === 'string' &&
            !!taskVal && typeof taskVal.id === 'string' && typeof taskVal.title === 'string'
          )
        })
        setActiveTimers(list)
        const mine = list.find((t) => t.user.id === user?.id)
        if (mine) {
          // Don't auto-start the timer - let user manually start it
          // setIsRunning(true)
          setCurrentTimerId(mine.id)
        }
      } catch (e) { console.error(e) }
    }
    fetchActive()
    const interval = setInterval(fetchActive, 10000)
    return () => clearInterval(interval)
  }, [API_URL, teamId, user?.id])

  // Cleanup break reminder timeout on unmount
  useEffect(() => {
    return () => {
      if (breakReminderTimeout) {
        clearTimeout(breakReminderTimeout)
      }
    }
  }, [breakReminderTimeout])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalTime = mode === "focus" ? focusTime : breakTime
    return ((totalTime - currentTime) / totalTime) * 100
  }

  const startFocus = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      if (!selectedTask || selectedTask === 'no') {
        addNotification({
          title: 'Task Required',
          body: 'Please select a task before starting the timer.'
        })
        return
      }
      const res = await fetch(`${API_URL}/focus/start`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ taskId: selectedTask }) })
      const data = (await res.json()) as { id: string } | { error: string }
      if (!res.ok) throw new Error((data as { error?: string }).error || 'Failed to start focus')
      if ('id' in data) {
        setCurrentTimerId(data.id)
      }
      setIsRunning(true)
      // refresh active timers list
      if (teamId) {
        try {
          const res2 = await fetch(`${API_URL}/focus/active?teamId=${teamId}`, { headers: { Authorization: `Bearer ${token}` } })
          const list = (await res2.json()) as unknown
          setActiveTimers(Array.isArray(list) ? (list as ActiveTimer[]) : [])
        } catch {}
      }
    } catch (e) { 
      console.error(e)
      addNotification({
        title: 'Timer Error',
        body: 'Failed to start focus session. Please try again.'
      })
    }
  }

  const endFocus = async (isPause = false) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const body: Record<string, string> = currentTimerId ? { timerId: currentTimerId } : {}
      const res = await fetch(`${API_URL}/focus/end`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) {
        // If no active timer found, just stop the UI timer gracefully
        if (data?.error?.includes('Active timer not found')) {
          setIsRunning(false)
          setCurrentTimerId('')
          return
        }
        throw new Error(data?.error || 'Failed to end focus')
      }
      setIsRunning(false)
      setCurrentTimerId('')
      
      // Only send notifications if this is a natural completion (not a pause)
      if (!isPause) {
        // Send focus completion notification
        addNotification({
          title: 'Focus Session Complete! 🎉',
          body: 'Great work! Take a 5-minute break to recharge.'
        })
        
        // Set break reminder after 5 minutes
        const timeout = setTimeout(() => {
          addNotification({
            title: 'Break\'s Over! ⏰',
            body: 'Time to get back to work. Start your next focus session.'
          })
        }, TIMER_CONFIG.BREAK_REMINDER_DELAY)
        setBreakReminderTimeout(timeout)
      }
      
      // refresh active timers list
      if (teamId) {
        try {
          const res2 = await fetch(`${API_URL}/focus/active?teamId=${teamId}`, { headers: { Authorization: `Bearer ${token}` } })
          const list = (await res2.json()) as unknown
          setActiveTimers(Array.isArray(list) ? (list as ActiveTimer[]) : [])
        } catch {}
      }
    } catch (e) { 
      console.error(e)
      // Gracefully handle errors - just stop the UI timer
      setIsRunning(false)
      setCurrentTimerId('')
    }
  }

  // Merge handlers (removed duplicates)
  const handleStart = () => {
    if (isRunning || currentTimerId) return
    // Only start running after backend confirms timer creation
    startFocus();
  }

  const handlePause = () => {
    setIsRunning(false);
    endFocus(true); // Pass true to indicate this is a pause, not completion
  }

  const handleReset = () => {
    setIsRunning(false);
    setCurrentTime(mode === 'focus' ? focusTime : breakTime);
    // Reset doesn't trigger notifications - just resets the timer
  }

  const formatSince = (iso: string) => {
    const started = new Date(iso).getTime()
    const now = Date.now()
    const sec = Math.max(0, Math.floor((now - started) / 1000))
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`
  }

  return (
    <div className="flex flex-col overflow-hidden">
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
                        <SelectValue placeholder="Choose a task to focus on" />
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
                            disabled={!selectedTask || selectedTask === 'no'}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Today&rsquo;s Progress
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
                      See who&rsquo;s currently focused
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeTimers.map((timer) => (
                      <div key={timer.id} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white text-sm">
                              {timer.user.name?.slice(0,2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                            'bg-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{timer.user.name}</p>
                          <p className="text-gray-400 text-xs truncate">{timer.task.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-mono">{formatSince(timer.startedAt)}</p>
                          <Badge 
                            variant="outline" 
                            className={`text-xs border-blue-500/50 text-blue-400`}
                          >
                            focus
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
    
  );
}
