"use client"

import React, { useState } from 'react';
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import DashboardLayout from './DashboardLayout';
import Sidebar from './Sidebar';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Clock, 
  User, 
  Calendar,
  Flag,
  Timer,
  Play,
  Pause,
  CheckSquare2,
  MessageSquare,
  Paperclip
} from 'lucide-react';

type NavigateFunction = (page: 'landing' |'analytics' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'profile') => void;

interface TasksPageProps {
  onNavigate: NavigateFunction;
  onLogout: () => void;
}

export default function TasksPage({ onNavigate, onLogout }: TasksPageProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const columns = [
    { id: 'todo', title: 'To Do', count: 8, color: 'border-gray-500' },
    { id: 'in-progress', title: 'In Progress', count: 5, color: 'border-blue-500' },
    { id: 'review', title: 'Review', count: 3, color: 'border-yellow-500' },
    { id: 'done', title: 'Done', count: 12, color: 'border-green-500' }
  ];

  const tasks = {
    'todo': [
      {
        id: 1,
        title: "Implement user authentication",
        description: "Set up JWT-based authentication system",
        priority: "high",
        assignee: { name: "Sarah M.", avatar: "SM" },
        dueDate: "2024-01-15",
        timeEstimate: "4h",
        comments: 2,
        attachments: 1
      },
      {
        id: 2,
        title: "Design mobile navigation",
        description: "Create responsive navigation for mobile devices",
        priority: "medium",
        assignee: { name: "Mike R.", avatar: "MR" },
        dueDate: "2024-01-18",
        timeEstimate: "2h",
        comments: 0,
        attachments: 0
      }
    ],
    'in-progress': [
      {
        id: 3,
        title: "API endpoint optimization",
        description: "Optimize database queries for better performance",
        priority: "high",
        assignee: { name: "You", avatar: "JD" },
        dueDate: "2024-01-12",
        timeEstimate: "6h",
        timeSpent: "2h 30m",
        comments: 5,
        attachments: 2,
        isActive: true
      },
      {
        id: 4,
        title: "Update documentation",
        description: "Update API documentation with new endpoints",
        priority: "low",
        assignee: { name: "Emily C.", avatar: "EC" },
        dueDate: "2024-01-20",
        timeEstimate: "3h",
        timeSpent: "1h 15m",
        comments: 1,
        attachments: 0
      }
    ],
    'review': [
      {
        id: 5,
        title: "Payment integration testing",
        description: "Test Stripe payment integration thoroughly",
        priority: "high",
        assignee: { name: "David K.", avatar: "DK" },
        dueDate: "2024-01-10",
        timeEstimate: "4h",
        timeSpent: "4h",
        comments: 3,
        attachments: 1
      }
    ],
    'done': [
      {
        id: 6,
        title: "Landing page redesign",
        description: "Complete redesign of the marketing landing page",
        priority: "medium",
        assignee: { name: "Sarah M.", avatar: "SM" },
        dueDate: "2024-01-08",
        timeEstimate: "8h",
        timeSpent: "7h 45m",
        comments: 8,
        attachments: 3,
        completedAt: "2024-01-08"
      }
    ]
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 text-red-400';
      case 'medium': return 'border-yellow-500/50 text-yellow-400';
      case 'low': return 'border-green-500/50 text-green-400';
      default: return 'border-gray-500/50 text-gray-400';
    }
  };

  const TaskCard = ({ task, columnId }: { task: any; columnId: string }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      className="group"
    >
      <Card className="bg-black/60 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
              <Flag className="w-3 h-3 mr-1" />
              {task.priority}
            </Badge>
            <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
          
          <h4 className="text-white font-medium mb-2 line-clamp-2">{task.title}</h4>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">{task.description}</p>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white text-xs">
                  {task.assignee.avatar}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-400">{task.assignee.name}</span>
            </div>
            
            {task.isActive && (
              <div className="flex items-center text-blue-400">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-2" />
                <span className="text-xs">Active</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {task.dueDate}
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {task.timeSpent || task.timeEstimate}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {task.comments > 0 && (
                <div className="flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {task.comments}
                </div>
              )}
              {task.attachments > 0 && (
                <div className="flex items-center">
                  <Paperclip className="w-3 h-3 mr-1" />
                  {task.attachments}
                </div>
              )}
            </div>
          </div>
          
          {columnId === 'in-progress' && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => onNavigate('timer')}
                className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
              >
                {task.isActive ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Start Timer
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
      <Sidebar currentPage="tasks" onNavigate={onNavigate} onLogout={onLogout} />
      
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
                Tasks
              </motion.h1>
              <p className="text-gray-400 mt-1">Manage your team's work and stay organized.</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Button 
                  variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('kanban')}
                  className={viewMode === 'kanban' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''}
                >
                  Kanban
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''}
                >
                  List
                </Button>
              </div>
              
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New Task</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Add a new task to your project board.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Task Title</Label>
                      <Input
                        id="title"
                        placeholder="Enter task title"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the task"
                        className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Priority</Label>
                        <Select>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/10">
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Assignee</Label>
                        <Select>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white">
                            <SelectValue placeholder="Assign to" />
                          </SelectTrigger>
                          <SelectContent className="bg-black/90 border-white/10">
                            <SelectItem value="you">You</SelectItem>
                            <SelectItem value="sarah">Sarah M.</SelectItem>
                            <SelectItem value="mike">Mike R.</SelectItem>
                            <SelectItem value="emily">Emily C.</SelectItem>
                            <SelectItem value="david">David K.</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="due-date">Due Date</Label>
                        <Input
                          id="due-date"
                          type="date"
                          className="bg-white/5 border-white/10 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="estimate">Time Estimate</Label>
                        <Input
                          id="estimate"
                          placeholder="e.g., 2h 30m"
                          className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Create Task
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-10 w-64 bg-white/5 border-white/10 text-white placeholder-gray-400"
                />
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Total: 28 tasks</span>
              <span>•</span>
              <span>Active timers: 2</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
              {columns.map((column) => (
                <motion.div 
                  key={column.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col h-full"
                >
                  <div className={`border-t-4 ${column.color} bg-black/40 backdrop-blur-xl border-x border-b border-white/10 rounded-t-lg px-4 py-3`}>
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-white">{column.title}</h3>
                      <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                        {column.count}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-black/20 backdrop-blur-xl border-x border-b border-white/10 rounded-b-lg p-4 space-y-4 overflow-y-auto">
                    {tasks[column.id as keyof typeof tasks]?.map((task) => (
                      <TaskCard key={task.id} task={task} columnId={column.id} />
                    ))}
                    
                    {column.id === 'todo' && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant="ghost"
                          className="w-full h-20 border-2 border-dashed border-white/20 text-gray-400 hover:text-white hover:border-white/40 transition-all"
                          onClick={() => setIsCreateDialogOpen(true)}
                        >
                          <Plus className="w-5 h-5 mr-2" />
                          Add task
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            // List View (placeholder)
            <div className="space-y-4">
              <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                <CardContent className="p-6">
                  <div className="text-center text-gray-400">
                    <CheckSquare2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>List view coming soon...</p>
                    <p className="text-sm mt-2">For now, use the Kanban board to manage your tasks.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}