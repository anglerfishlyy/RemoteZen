"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { PRODUCTIVITY_CONFIG, UI_CONFIG } from '@/lib/config';
import { useSession } from "next-auth/react";
import { 
  Plus, 
  CheckSquare, 
  Users, 
  TrendingUp, 
  Timer, 
  Target,
  Zap,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react';

type NavigateFunction = (page: 'landing' |'analytics' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'profile') => void;

interface DashboardProps {
  onNavigate: NavigateFunction;
  onLogout: () => void;
}

export default function Dashboard({ onNavigate, onLogout: _onLogout }: DashboardProps) {
  const { data: session, status } = useSession();
  const user = session?.user;

  type ApiTask = { id: string; title: string; status?: 'PENDING'|'IN_PROGRESS'|'DONE'; teamId: string; assignedToId?: string|null }
  type ActiveTimer = { id: string; startedAt: string; user: { id: string; name: string }; task: { id: string; title: string } }
  type Productivity = { totalFocusSeconds: number; tasksCompleted: number; avgFocusPerUser: number }

  const [teamId, setTeamId] = useState<string>('')
  const [tasks, setTasks] = useState<ApiTask[]>([])
  const [activeTimers, setActiveTimers] = useState<ActiveTimer[]>([])
  const [productivity, setProductivity] = useState<Productivity | null>(null)

  // bootstrap: load team, tasks, analytics
  useEffect(() => {
    if (!user) return
    const initialize = async () => {
      try {
        const meRes = await fetch('/api/user/me', { credentials: 'include' })
        if (!meRes.ok) return
        const me = await meRes.json()
        const firstTeam = me?.user?.teams?.[0]?.team
        if (!firstTeam) return
        setTeamId(firstTeam.id)

        const tRes = await fetch(`/api/tasks?teamId=${firstTeam.id}`, { credentials: 'include' })
        const tData = await tRes.json()
        setTasks(Array.isArray(tData) ? tData : [])

        // Calculate productivity from focus logs
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7*24*60*60*1000);
        const logsRes = await fetch('/api/focus', { credentials: 'include' })
        if (logsRes.ok) {
          const logs = await logsRes.json()
          const teamLogs = Array.isArray(logs) ? logs.filter((l: any) => l.startTime >= weekAgo.toISOString()) : []
          const totalSeconds = teamLogs.reduce((sum: number, l: any) => sum + (l.duration || 0), 0)
          const completedTasks = tasks.filter(t => t.status === 'DONE').length
          setProductivity({
            totalFocusSeconds: totalSeconds,
            tasksCompleted: completedTasks,
            avgFocusPerUser: totalSeconds / Math.max(1, me?.user?.teams?.length || 1)
          })
        }
      } catch (e) { console.error(e) }
    }
    initialize()
  }, [user])

  // poll active timers and refresh tasks periodically
  useEffect(() => {
    if (!teamId) return
    const refresh = async () => {
      try {
        const aRes = await fetch(`/api/focus/active?teamId=${teamId}`, { credentials: 'include' })
        const a = await aRes.json()
        setActiveTimers(Array.isArray(a) ? a : [])

        const tRes = await fetch(`/api/tasks?teamId=${teamId}`, { credentials: 'include' })
        const tData = await tRes.json()
        setTasks(Array.isArray(tData) ? tData : [])
      } catch (e) { console.error(e) }
    }
    refresh()
    const interval = setInterval(refresh, UI_CONFIG.POLLING_INTERVAL)
    return () => clearInterval(interval)
  }, [teamId])

  const myFirstName = useMemo(() => (user?.name || '').split(' ')[0] || 'there', [user?.name])
  const totalTasks = tasks.length
  const tasksCompleted = tasks.filter(t => t.status === 'DONE').length
  const activeTimersCount = activeTimers.length
  const totalFocusHuman = useMemo(() => {
    const s = productivity?.totalFocusSeconds || 0
    const h = Math.floor(s/3600); const m = Math.floor((s%3600)/60)
    return `${h > 0 ? h + 'h ' : ''}${m}m`
  }, [productivity])

  const stats = [
    { label: "Total Tasks", value: String(totalTasks), change: `${tasksCompleted} completed`, icon: CheckSquare, color: "from-green-500 to-emerald-600" },
    { label: "Active Timers", value: String(activeTimersCount), change: "live", icon: Timer, color: "from-blue-500 to-cyan-600" },
    { label: "Focus Time (7d)", value: totalFocusHuman, change: productivity ? `Avg/user ${Math.round((productivity.avgFocusPerUser||0)/60)}m` : '—', icon: TrendingUp, color: "from-purple-500 to-pink-600" },
    { label: "Completed", value: String(tasksCompleted), change: "this team", icon: Target, color: "from-orange-500 to-red-600" },
  ];

  return (
    <>
      {/* Page Title + CTAs (under the fixed header) */}
      <div className="px-6 pt-2 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white"
            >
              Welcome back, {myFirstName} 👋
            </motion.h1>
            <p className="text-gray-400 mt-1">Live view of your team’s tasks and focus.</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => onNavigate('tasks')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
            <Button 
              onClick={() => {
                if (tasks.length === 0) {
                  // Navigate to tasks page if no tasks available
                  onNavigate('tasks')
                } else {
                  // Navigate to timer page
                  onNavigate('timer')
                }
              }}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Play className="w-4 h-4 mr-2" />
              {tasks.length === 0 ? 'Create Task First' : 'Start Timer'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-6 pb-6">
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Stats Grid */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Card className="bg-black/40 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-400 text-sm">{stat.label}</p>
                          <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                          <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* My Tasks */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-white">My Tasks</CardTitle>
                      <CardDescription className="text-gray-400">
                        Your team’s recent tasks
                      </CardDescription>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onNavigate('tasks')}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                    >
                      View all
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tasks.slice(0,8).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-3 h-3 rounded-full ${
                            task.status === 'DONE' ? 'bg-green-400' :
                            task.status === 'IN_PROGRESS' ? 'bg-blue-400' : 'bg-gray-400'
                          }`} />
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{task.title}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <Badge variant="outline" className="text-xs border-white/20 text-gray-300">
                                {task.status?.replace('_',' ') || 'PENDING'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.status === 'IN_PROGRESS' && (
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                              <Pause className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Team Activity */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                {/* Team Status */}
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Team Activity
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Live focus sessions right now
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeTimers.map((t) => (
                      <div key={t.id} className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white text-sm">
                              {t.user.name?.slice(0,2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                            'bg-green-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{t.user.name}</p>
                          <p className="text-gray-400 text-xs">{t.task.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">active</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Weekly Focus */}
                <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Weekly Focus
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Team productivity (past 7 days)
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-300">Total Focus Time</span>
                        <span className="text-sm text-white">{totalFocusHuman}</span>
                      </div>
                      <Progress value={Math.min(100, Math.round(((productivity?.totalFocusSeconds||0) / PRODUCTIVITY_CONFIG.WEEKLY_FOCUS_TARGET) * 100))} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-300">Tasks Completed</span>
                        <span className="text-sm text-white">{tasksCompleted}</span>
                      </div>
                      <Progress value={totalTasks ? Math.round((tasksCompleted/totalTasks)*100) : 0} className="h-2" />
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Active Timers</span>
                        <div className="flex items-center text-orange-400">
                          <Zap className="w-4 h-4 mr-1" />
                          <span className="font-medium">{activeTimersCount}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
        </div>
      </main>
    </>
  );
}