import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Timer, Play, CheckSquare } from 'lucide-react';
import { useAuth, useNotifications } from '@/app/providers';

interface Task {
  id: string;
  title: string;
  status: string;
}

interface QuickTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickTimerModal({ isOpen, onClose }: QuickTimerModalProps) {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [message, setMessage] = useState('');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isOpen) {
      loadTasks();
    }
  }, [isOpen]);

  const loadTasks = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsLoading(true);
      const meRes = await fetch(`${API_URL}/auth/me`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const me = await meRes.json();
      const team = me?.teams?.[0];
      
      if (!team) {
        setMessage('No team found');
        return;
      }

      const tasksRes = await fetch(`${API_URL}/tasks?teamId=${team.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json();
        setTasks(tasksData.filter((task: Task) => task.status !== 'DONE'));
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
      setMessage('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTimer = async () => {
    if (!selectedTask) {
      setMessage('Please select a task');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setIsStarting(true);
      setMessage('');

      const response = await fetch(`${API_URL}/focus/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ taskId: selectedTask })
      });

      if (response.ok) {
        addNotification({
          title: 'Timer Started! 🎯',
          body: 'Focus session has begun. Stay focused!'
        });
        onClose();
      } else {
        const error = await response.json();
        setMessage(error.error || 'Failed to start timer');
      }
    } catch (error) {
      console.error('Error starting timer:', error);
      setMessage('Failed to start timer');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg">
                  <Timer className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Start Timer</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-300">Loading tasks...</span>
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8">
                  <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-300 mb-4">No available tasks to work on</p>
                  <p className="text-sm text-gray-500">Create a task first to start a timer</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Select a task to focus on
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                      {tasks.map((task) => (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTask(task.id)}
                          className={`w-full p-3 text-left rounded-lg border transition-all duration-200 ${
                            selectedTask === task.id
                              ? 'border-blue-500 bg-blue-500/20 text-white'
                              : 'border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <CheckSquare className="w-4 h-4" />
                            <span className="flex-1">{task.title}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              task.status === 'IN_PROGRESS' 
                                ? 'bg-yellow-500/20 text-yellow-400' 
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Messages */}
                  {message && (
                    <div className={`p-3 rounded-lg text-sm ${
                      message.includes('success') || message.includes('started')
                        ? 'bg-green-500/20 border border-green-500/30 text-green-400'
                        : 'bg-red-500/20 border border-red-500/30 text-red-400'
                    }`}>
                      {message}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStartTimer}
                      disabled={!selectedTask || isStarting}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg text-white transition-all duration-300 flex items-center justify-center space-x-2"
                    >
                      {isStarting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Start Focus</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
