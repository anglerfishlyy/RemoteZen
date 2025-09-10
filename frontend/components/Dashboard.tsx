"use client"

import React from 'react';
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import DashboardLayout from './DashboardLayout';
import { 
  Plus, 
  Clock, 
  CheckSquare, 
  Users, 
  TrendingUp, 
  Timer, 
  Calendar,
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

export default function Dashboard({ onNavigate, onLogout }: DashboardProps) {
  const tasks = [
    { id: 1, title: "Design new landing page", status: "in-progress", priority: "high", timeSpent: "2h 30m", assignee: "You" },
    { id: 2, title: "Review API documentation", status: "pending", priority: "medium", timeSpent: "0m", assignee: "Sarah M." },
    { id: 3, title: "Fix authentication bug", status: "in-progress", priority: "high", timeSpent: "1h 15m", assignee: "Mike R." },
    { id: 4, title: "Update user dashboard", status: "completed", priority: "low", timeSpent: "45m", assignee: "You" },
  ];

  const teamMembers = [
    { name: "Sarah Martinez", status: "Working on API Review", time: "1h 23m", avatar: "SM", online: true },
    { name: "Mike Rodriguez", status: "Debugging Auth Issues", time: "2h 45m", avatar: "MR", online: true },
    { name: "Emily Chen", status: "Away", time: "0m", avatar: "EC", online: false },
    { name: "David Kim", status: "In Meeting", time: "30m", avatar: "DK", online: true },
  ];

  const stats = [
    { label: "Tasks Completed", value: "12", change: "+3 from yesterday", icon: CheckSquare, color: "from-green-500 to-emerald-600" },
    { label: "Focus Time", value: "6h 42m", change: "+1h 15m from yesterday", icon: Timer, color: "from-blue-500 to-cyan-600" },
    { label: "Team Productivity", value: "94%", change: "+5% from last week", icon: TrendingUp, color: "from-purple-500 to-pink-600" },
    { label: "Active Projects", value: "8", change: "+2 new projects", icon: Target, color: "from-orange-500 to-red-600" },
  ];

  return (
    <DashboardLayout currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      {/* Header */}
      <header className="bg-black/40 backdrop-blur-xl border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-white"
            >
              Good evening, John 👋
            </motion.h1>
            <p className="text-gray-400 mt-1">Here's what's happening with your projects today.</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => onNavigate('tasks')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
            <Button 
              onClick={() => onNavigate('timer')}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Timer
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
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
                        Your active and recent tasks
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
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center space-x-4 flex-1">
                          <div className={`w-3 h-3 rounded-full ${
                            task.status === 'completed' ? 'bg-green-400' :
                            task.status === 'in-progress' ? 'bg-blue-400' : 'bg-gray-400'
                          }`} />
                          <div className="flex-1">
                            <h4 className="text-white font-medium">{task.title}</h4>
                            <div className="flex items-center space-x-4 mt-1">
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  task.priority === 'high' ? 'border-red-500/50 text-red-400' :
                                  task.priority === 'medium' ? 'border-yellow-500/50 text-yellow-400' :
                                  'border-gray-500/50 text-gray-400'
                                }`}
                              >
                                {task.priority}
                              </Badge>
                              <span className="text-sm text-gray-400">{task.assignee}</span>
                              <span className="text-sm text-gray-400 flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {task.timeSpent}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {task.status === 'in-progress' && (
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
                      See what your team is working on
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white text-sm">
                              {member.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-black ${
                            member.online ? 'bg-green-400' : 'bg-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm font-medium">{member.name}</p>
                          <p className="text-gray-400 text-xs">{member.status}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 text-xs">{member.time}</p>
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
                      Your progress this week
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-300">Focus Time Goal</span>
                        <span className="text-sm text-white">32h / 40h</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-300">Tasks Completed</span>
                        <span className="text-sm text-white">18 / 25</span>
                      </div>
                      <Progress value={72} className="h-2" />
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Streak</span>
                        <div className="flex items-center text-orange-400">
                          <Zap className="w-4 h-4 mr-1" />
                          <span className="font-medium">7 days</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
        </div>
      </main>
    </DashboardLayout>
  );
}