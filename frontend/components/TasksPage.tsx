"use client"

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from "framer-motion"
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import Sidebar from './Sidebar';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Clock, 
  Calendar,
  Flag,
  Play,
  Pause,
  CheckSquare2,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { useAuth } from '@/app/providers';

type NavigateFunction = (page: 'landing' |'analytics' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'profile') => void;

interface TasksPageProps {
  onNavigate: NavigateFunction;
  onLogout: () => void;
}

interface UserBrief { id: string; name: string }
interface TaskType {
  id: string;
  title: string;
  description?: string | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  assignedTo?: UserBrief | null;
  createdBy?: UserBrief | null;
  team?: { id: string; name: string } | null;
  dueDate?: string | null;
  timeSpent?: string;
  timeEstimate?: string;
  comments?: number;
  attachments?: number;
  isActive?: boolean;
}
interface TeamMemberBrief { id: string; name: string }

export default function TasksPage({ onNavigate, onLogout: _onLogout }: TasksPageProps) {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [tasksMy, setTasksMy] = useState<TaskType[]>([]);
  const [showMine, setShowMine] = useState(false);
  const [teamId, setTeamId] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMemberBrief[]>([]);
  const [activeTimers, setActiveTimers] = useState<number>(0);

  // Derive user's first teamId for now
  useEffect(() => {
    if (!user) return;
    // Call /api/user/me to get teams so we know teamId and members
    const load = async () => {
      try {
        const res = await fetch('/api/user/me', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        const firstTeam = data.user?.teams?.[0]?.team;
        if (firstTeam) {
          setTeamId(firstTeam.id);
          // fetch members of this team to populate assignee select
          const memRes = await fetch(`/api/teams/${firstTeam.id}/members`, { credentials: 'include' });
          if (memRes.ok) {
            const mem = await memRes.json();
            setTeamMembers((mem || []).map((m: { user: UserBrief }) => ({ id: m.user.id, name: m.user.name })));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [user]);

  useEffect(() => {
    if (!teamId) return;
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/tasks?teamId=${teamId}`, { credentials: 'include' });
        const data = await res.json();
        setTasks(Array.isArray(data) ? data : []);
        // also load my tasks
        const resMy = await fetch(`/api/tasks?assignedToId=me`, { credentials: 'include' });
        if (resMy.ok) {
          const dataMy = await resMy.json();
          setTasksMy(Array.isArray(dataMy) ? dataMy : []);
        }
        // load active timers
        const activeRes = await fetch(`/api/focus/active?teamId=${teamId}`, { credentials: 'include' });
        if (activeRes.ok) {
          const active = await activeRes.json();
          setActiveTimers(Array.isArray(active) ? active.length : 0);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [teamId]);

  const sourceTasks: TaskType[] = showMine ? tasksMy : tasks;

  const grouped = useMemo(() => {
    const by: Record<string, TaskType[]> = { PENDING: [], IN_PROGRESS: [], DONE: [] };
    for (const t of sourceTasks) {
      (by[t.status] || by.PENDING).push(t);
    }
    return by;
  }, [sourceTasks]);

  const createTask = async (payload: { title: string; description?: string; dueDate?: string; assignedToId?: string }) => {
    if (!teamId) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ teamId, ...payload }),
    });
    const data: TaskType | { error?: string } = await res.json();
    if (!res.ok) throw new Error(('error' in data && data.error) || 'Failed to create task');
    // Optimistic update
    setTasks((prev) => [data as TaskType, ...prev]);
    // Ensure server is source of truth
    try {
      const refreshed = await fetch(`/api/tasks?teamId=${teamId}`, { credentials: 'include' });
      const refreshedData = await refreshed.json();
      if (Array.isArray(refreshedData)) setTasks(refreshedData);
    } catch {}
  };

  const updateTask = async (id: string, updates: Partial<TaskType> & { status?: TaskType['status']; assignedToId?: string | null; dueDate?: string | null }) => {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updates),
    });
    const data: TaskType | { error?: string } = await res.json();
    if (!res.ok) throw new Error(('error' in data && data.error) || 'Failed to update task');
    setTasks((prev) => prev.map((t) => (t.id === id ? (data as TaskType) : t)));
  };

  const deleteTask = async (id: string) => {
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete task');
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const columns = [
    { id: 'PENDING', title: 'Pending', count: grouped.PENDING.length, color: 'border-gray-500' },
    { id: 'IN_PROGRESS', title: 'In Progress', count: grouped.IN_PROGRESS.length, color: 'border-blue-500' },
    { id: 'DONE', title: 'Done', count: grouped.DONE.length, color: 'border-green-500' }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/50 text-red-400';
      case 'medium': return 'border-yellow-500/50 text-yellow-400';
      case 'low': return 'border-green-500/50 text-green-400';
      default: return 'border-gray-500/50 text-gray-400';
    }
  };

  const TaskCard = ({ task, columnId }: { task: TaskType; columnId: string }) => (
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
            <Badge variant="outline" className={`text-xs ${getPriorityColor('medium')}`}>
              <Flag className="w-3 h-3 mr-1" />
              {columnId === 'PENDING' ? 'pending' : columnId === 'IN_PROGRESS' ? 'in progress' : 'done'}
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
                  {(task.assignedTo?.name || 'U').slice(0,2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-400">{task.assignedTo?.name || 'Unassigned'}</span>
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
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {task.timeSpent || task.timeEstimate}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {(task.comments ?? 0) > 0 && (
                <div className="flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {task.comments}
                </div>
              )}
              {(task.attachments ?? 0) > 0 && (
                <div className="flex items-center">
                  <Paperclip className="w-3 h-3 mr-1" />
                  {task.attachments}
                </div>
              )}
            </div>
          </div>
          
          {columnId === 'IN_PROGRESS' && (
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

          <div className="mt-3 flex items-center justify-between">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white"
              onClick={async () => {
                const next = task.status === 'PENDING' ? 'IN_PROGRESS' : task.status === 'IN_PROGRESS' ? 'DONE' : 'DONE';
                try { await updateTask(task.id, { status: next }); } catch (e) { console.error(e); }
              }}
            >
              <CheckSquare2 className="w-4 h-4 mr-2" />
              {task.status === 'PENDING' ? 'Start' : task.status === 'IN_PROGRESS' ? 'Complete' : 'Done'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={async () => { try { await deleteTask(task.id); } catch (e) { console.error(e); } }}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
                Tasks
              </motion.h1>
              <p className="text-gray-400 mt-1">Manage your team’s work and stay organized.</p>
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
                    <TaskCreateForm onCreate={async (payload) => { await createTask(payload); setIsCreateDialogOpen(false); }} teamMembers={teamMembers} />
                    
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Fix: Filters - responsive layout */}
        <div className="border-b border-white/10 px-4 md:px-6 py-3 md:py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
            <div className="flex flex-wrap items-center gap-2 md:gap-4">
              <div className="relative flex-1 md:flex-none min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search tasks..."
                  className="pl-10 w-full md:w-64 bg-white/5 border-white/10 text-white placeholder-gray-400 text-sm"
                />
              </div>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs md:text-sm">
                <Filter className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              <Button variant={showMine ? 'default' : 'ghost'} size="sm" onClick={() => setShowMine((v) => !v)} className={`text-xs md:text-sm ${showMine ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''}`}>
                <span className="hidden md:inline">{showMine ? 'Showing: My Tasks' : 'Show: My Tasks'}</span>
                <span className="md:hidden">{showMine ? 'My Tasks' : 'All Tasks'}</span>
              </Button>
            </div>
            
            {/* Fix: Stats - responsive layout */}
            <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-400">
              <span>Total: {sourceTasks.length}</span>
              <span className="hidden sm:inline">•</span>
              <span>Timers: {activeTimers}</span>
            </div>
          </div>
        </div>

        {/* Fix: Main Content - responsive grid */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 h-full">
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
                    {(grouped[column.id as keyof typeof grouped] || []).map((task) => (
                      <TaskCard key={task.id} task={task} columnId={column.id} />
                    ))}
                    
                    {column.id === 'PENDING' && (
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
              {!loading && sourceTasks.length === 0 && (
                <div className="col-span-full">
                  <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                    <CardContent className="p-10 text-center text-gray-400">
                      No tasks yet. Create one to get started!
                    </CardContent>
                  </Card>
                </div>
              )}
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
    
  );
}

function TaskCreateForm({ onCreate, teamMembers }: { onCreate: (p: { title: string; description?: string; dueDate?: string; assignedToId?: string }) => Promise<void>, teamMembers: TeamMemberBrief[] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assignedToId, setAssignedToId] = useState<string | undefined>(undefined);

  return (
    <>
      <div>
        <Label htmlFor="title">Task Title</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title" className="bg-white/5 border-white/10 text-white placeholder-gray-400" />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task" className="bg-white/5 border-white/10 text-white placeholder-gray-400" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Assignee</Label>
          <Select onValueChange={(v) => setAssignedToId(v)}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Assign to" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/10">
              {teamMembers.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="due-date">Due Date</Label>
          <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-white/5 border-white/10 text-white" />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="ghost" onClick={() => { setTitle(''); setDescription(''); setDueDate(''); setAssignedToId(undefined); }}>
          Clear
        </Button>
        <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700" onClick={async () => {
          await onCreate({ title, description, dueDate, assignedToId });
          setTitle(''); setDescription(''); setDueDate(''); setAssignedToId(undefined);
        }}>
          Create Task
        </Button>
      </div>
    </>
  );
}
