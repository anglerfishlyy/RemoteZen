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

  // Fix: Timer effect - properly stops after 25 minutes and handles break time
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning && currentTime > 0) {
      interval = setInterval(() => {
        setCurrentTime((time) => {
          const newTime = time - 1
          // Fix: When timer reaches 0, stop it immediately
          if (newTime <= 0) {
            setIsRunning(false)
            return 0
          }
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, currentTime])

  // Fix: Handle timer completion when it reaches 0 (separate effect to avoid race conditions)
  useEffect(() => {
    if (currentTime === 0 && !isRunning) {
      if (mode === "focus") {
        // Focus session completed - switch to break mode and auto-start break timer
        setSessionsCompleted((prev) => prev + 1)
        setMode("break")
        setCurrentTime(breakTime)
        
        // Fix: Show notification for break time
        addNotification({
          title: 'Time for Break! ☕',
          body: 'Great work! Take a 5-minute break to recharge.',
          type: 'success'
        })
        
        // Fix: End the focus session in the database
        if (currentTimerId) {
          endFocus(false).catch(console.error)
        }
        
        // Fix: Auto-start break timer after a short delay
        const breakTimer = setTimeout(() => {
          setIsRunning(true)
        }, 1000) // 1 second delay to ensure state updates
        
        return () => clearTimeout(breakTimer)
      } else if (mode === "break") {
        // Break completed - switch back to focus mode but don't auto-start
        setMode("focus")
        setCurrentTime(focusTime)
        
        // Fix: Show notification to start next session
        addNotification({
          title: 'Break\'s Over! ⏰',
          body: 'Time to get back to work. Start your next 25-minute focus session.',
          type: 'info'
        })
      }
    }
  }, [currentTime, isRunning, mode, focusTime, breakTime, addNotification, currentTimerId])

  // Fix: Handle timer completion when it reaches 0 (separate effect to avoid race conditions)
  useEffect(() => {
    if (currentTime === 0 && !isRunning) {
      if (mode === "focus") {
        // Focus session completed - switch to break mode
        setSessionsCompleted((prev) => prev + 1)
        setMode("break")
        setCurrentTime(breakTime)
        
        // Fix: Show notification for break time
        addNotification({
          title: 'Time for Break! ☕',
          body: 'Great work! Take a 5-minute break to recharge.',
          type: 'success'
        })
        
        // Fix: End the focus session in the database
        if (currentTimerId) {
          endFocus(false).catch(console.error)
        }
      } else if (mode === "break") {
        // Break completed - switch back to focus mode but don't auto-start
        setMode("focus")
        setCurrentTime(focusTime)
        
        // Fix: Show notification to start next session
        addNotification({
          title: 'Break\'s Over! ⏰',
          body: 'Time to get back to work. Start your next 25-minute focus session.',
          type: 'info'
        })
      }
    }
  }, [currentTime, isRunning, mode, focusTime, breakTime, addNotification, currentTimerId])

  // Fix: Load team, tasks, and current active focus log using NextAuth session
  useEffect(() => {
    if (!user) return
    const load = async () => {
      try {
        // Get user teams
        const meRes = await fetch('/api/user/me', { credentials: 'include' })
        if (!meRes.ok) return
        const me = await meRes.json()
        const firstTeam = me?.user?.teams?.[0]?.team
        if (firstTeam) {
          setTeamId(firstTeam.id)
          // Get tasks
          const taskRes = await fetch(`/api/tasks?teamId=${firstTeam.id}`, { credentials: 'include' })
          if (taskRes.ok) {
            const taskData = await taskRes.json()
            const list = Array.isArray(taskData) ? taskData : []
            setTasks(list.filter((t): t is ApiTask => Boolean(t?.id && t?.title)).map((t) => ({ id: t.id!, title: t.title! })))
          }
        }

        // Get focus logs
        const logsRes = await fetch('/api/focus', { credentials: 'include' })
        if (logsRes.ok) {
          const logsRaw = await logsRes.json()
          const logs: Array<FocusLog> = Array.isArray(logsRaw)
            ? (logsRaw as Array<Partial<FocusLog>>).filter((l): l is FocusLog => typeof l?.id === 'string' && typeof l?.startTime === 'string')
            : []
          const active = logs.find((l) => !l.endTime)
          if (active) {
            setActiveLogId(active.id)
          }

          const today = new Date().toDateString()
          const todayLogs = logs.filter((l) => new Date(l.startTime).toDateString() === today)
          const totalSec = todayLogs.reduce((acc: number, l) => acc + (l.duration || 0), 0)
          const hours = Math.floor(totalSec / 3600)
          const mins = Math.floor((totalSec % 3600) / 60)
          setTodayStats({ focusTime: `${hours > 0 ? hours + 'h ' : ''}${mins}m`, sessions: todayLogs.length, tasksCompleted: 0, productivity: Math.min(100, Math.round((totalSec / (4 * 3600)) * 100)) })
        }
      } catch (e) {
        console.error(e)
      }
    }
    load()
  }, [user])

  // Fix: Fetch active timers for team using NextAuth session
  useEffect(() => {
    if (!teamId || !user) return
    const fetchActive = async () => {
      try {
        const res = await fetch(`/api/focus/active?teamId=${teamId}`, { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        const listRaw: Array<unknown> = Array.isArray(data) ? data : []
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
          setCurrentTimerId(mine.id)
        }
      } catch (e) { console.error(e) }
    }
    fetchActive()
    const interval = setInterval(fetchActive, 10000)
    return () => clearInterval(interval)
  }, [teamId, user])

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

  // Fix: Use internal API routes with NextAuth session
  const startFocus = async () => {
    if (!user) return
    try {
      if (!selectedTask || selectedTask === 'no') {
        addNotification({
          title: 'Task Required',
          body: 'Please select a task before starting the timer.'
        })
        return
      }
      const res = await fetch('/api/focus/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ taskId: selectedTask })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to start focus')
      if (data?.id) {
        setCurrentTimerId(data.id)
      }
      setIsRunning(true)
      // refresh active timers list
      if (teamId) {
        try {
          const res2 = await fetch(`/api/focus/active?teamId=${teamId}`, { credentials: 'include' })
          if (res2.ok) {
            const list = await res2.json()
            setActiveTimers(Array.isArray(list) ? list : [])
          }
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

  // Fix: Use internal API routes with NextAuth session
  const endFocus = async (isPause = false) => {
    if (!user) return
    try {
      const body: Record<string, string> = currentTimerId ? { timerId: currentTimerId } : {}
      const res = await fetch('/api/focus/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (!res.ok) {
        // If no active timer found, just stop the UI timer gracefully
        if (data?.error?.includes('Active timer not found') || data?.error?.includes('Timer not found')) {
          setIsRunning(false)
          setCurrentTimerId('')
          return
        }
        throw new Error(data?.error || 'Failed to end focus')
      }
      setIsRunning(false)
      setCurrentTimerId('')
      
      // Fix: Don't send notifications here - they're handled in the timer completion effect
      // This function is just for ending the timer in the database
      
      // refresh active timers list
      if (teamId) {
        try {
          const res2 = await fetch(`/api/focus/active?teamId=${teamId}`, { credentials: 'include' })
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
        {/* Fix: Header - responsive layout */}
        <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xl md:text-2xl font-bold text-white"
              >
                Focus Timer
              </motion.h1>
              <p className="text-gray-400 mt-1 text-sm md:text-base">Stay focused and track your productivity with Pomodoro technique.</p>
            </div>
            
            {/* Fix: Buttons - responsive layout */}
            <div className="flex items-center space-x-2 md:space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs md:text-sm">
                <Settings className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => onNavigate('tasks')}
                className="border-white/20 text-white hover:bg-white/10 text-xs md:text-sm"
              >
                <Plus className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">New Task</span>
                <span className="sm:hidden">Task</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Fix: Main Content - responsive padding */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {/* Fix: Responsive grid layout */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            {/* Fix: Timer Section - responsive spacing */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6">
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

                      {/* Fix: Circular Timer - responsive sizing */}
                      <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto mb-6 md:mb-8">
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
                            <div className="text-4xl md:text-6xl font-bold text-white mb-2">
                              {formatTime(currentTime)}
                            </div>
                            <div className="text-xs md:text-sm text-gray-400 px-2">
                              {selectedTask ? tasks.find(t => t.id === selectedTask)?.title || 'Custom Focus Session' : 'Focus Session'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fix: Timer Controls - mobile readable buttons */}
                      <div className="flex items-center justify-center space-x-3 md:space-x-4">
                        {!isRunning ? (
                          <Button
                            size="lg"
                            onClick={handleStart}
                            disabled={!selectedTask || selectedTask === 'no'}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] md:min-h-[56px]"
                          >
                            <Play className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                            <span className="hidden sm:inline">Start Focus</span>
                            <span className="sm:hidden">Start</span>
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            onClick={handlePause}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold min-h-[48px] md:min-h-[56px]"
                          >
                            <Pause className="w-6 h-6 md:w-7 md:h-7 mr-2" />
                            Pause
                          </Button>
                        )}
                        
                        <Button
                          size="lg"
                          variant="outline"
                          onClick={handleReset}
                          className="border-white/20 text-white hover:bg-white/10 px-5 md:px-6 py-3 md:py-4 min-h-[48px] md:min-h-[56px]"
                        >
                          <RotateCcw className="w-6 h-6 md:w-7 md:h-7" />
                        </Button>
                      </div>

                      {/* Fix: Session Counter - responsive */}
                      <div className="mt-6 md:mt-8 flex items-center justify-center space-x-4 md:space-x-6 text-gray-400">
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-white">{sessionsCompleted}</div>
                          <div className="text-xs md:text-sm">Sessions Today</div>
                        </div>
                        <div className="w-px h-6 md:h-8 bg-white/10"></div>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-white">25m</div>
                          <div className="text-xs md:text-sm">Focus Duration</div>
                        </div>
                        <div className="w-px h-6 md:h-8 bg-white/10"></div>
                        <div className="text-center">
                          <div className="text-xl md:text-2xl font-bold text-white">5m</div>
                          <div className="text-xs md:text-sm">Break Duration</div>
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

            {/* Fix: Sidebar - responsive spacing */}
            <div className="space-y-4 md:space-y-6">
              {/* Fix: Today's Stats - responsive */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-white flex items-center text-base md:text-lg">
                      <TrendingUp className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Today&rsquo;s Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                    {/* Fix: Stats items - responsive text sizes */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 md:w-4 md:h-4 text-blue-400" />
                        <span className="text-xs md:text-sm text-gray-300">Focus Time</span>
                      </div>
                      <span className="text-sm md:text-base text-white font-medium">{todayStats.focusTime}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Timer className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                        <span className="text-xs md:text-sm text-gray-300">Sessions</span>
                      </div>
                      <span className="text-sm md:text-base text-white font-medium">{todayStats.sessions}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckSquare className="w-3 h-3 md:w-4 md:h-4 text-green-400" />
                        <span className="text-xs md:text-sm text-gray-300">Completed</span>
                      </div>
                      <span className="text-sm md:text-base text-white font-medium">{todayStats.tasksCompleted}</span>
                    </div>

                    <div className="pt-3 md:pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs md:text-sm text-gray-400">Productivity Score</span>
                        <span className="text-xs md:text-sm font-medium text-white">{todayStats.productivity}%</span>
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
                  {/* Fix: Active Timers - responsive layout */}
                  <CardContent className="space-y-3 md:space-y-4 p-4 md:p-6">
                    {activeTimers.map((timer) => (
                      <div key={timer.id} className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg bg-white/5">
                        <div className="relative flex-shrink-0">
                          <Avatar className="w-8 h-8 md:w-10 md:h-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white text-xs md:text-sm">
                              {timer.user?.name?.slice(0,2).toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-2 h-2 md:w-3 md:h-3 rounded-full border-2 border-black ${
                            'bg-blue-400'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs md:text-sm font-medium truncate">{timer.user?.name || 'Unknown User'}</p>
                          <p className="text-gray-400 text-xs truncate">{timer.task?.title || 'Unknown Task'}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-white text-xs md:text-sm font-mono">{formatSince(timer.startedAt)}</p>
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
