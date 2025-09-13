import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Target, Users, Activity, Calendar } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '@/app/providers';

type NavigateFunction = (page: 'landing' | 'analytics' | 'login' | 'dashboard' | 'tasks' | 'timer' | 'profile') => void;

interface AnalyticsPageProps {
  onNavigate: NavigateFunction;
  onLogout: () => void;
}

interface ProductivityData {
  date: string;
  focus_time: number;
  tasks_completed: number;
  productivity_score: number;
}

interface TaskDistribution {
  status: string;
  count: number;
  color: string;
}

interface WeeklyStats {
  week: string;
  team_productivity: number;
  individual_productivity: number;
}

interface TimeBreakdown {
  category: string;
  hours: number;
  color: string;
}

export default function AnalyticsPage({ onNavigate: _onNavigate, onLogout: _onLogout }: AnalyticsPageProps) {
  const { user } = useAuth()
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
  const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
  const [taskDistribution, setTaskDistribution] = useState<TaskDistribution[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [timeBreakdown, setTimeBreakdown] = useState<TimeBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token')
        if (!token || !user) return
        const meRes = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        const me = await meRes.json()
        const firstTeam = me?.teams?.[0]
        if (!firstTeam) return

        const now = new Date()
        const rangeDays = selectedPeriod === '90d' ? 90 : selectedPeriod === '30d' ? 30 : 7
        const from = new Date(now.getTime() - rangeDays*24*60*60*1000)
        const pRes = await fetch(`${API_URL}/analytics/productivity?teamId=${firstTeam.id}&from=${from.toISOString()}&to=${now.toISOString()}`, { headers: { Authorization: `Bearer ${token}` } })
        const p = await pRes.json()

        // Basic charts: convert productivity totals into chart-friendly shapes
        const days: ProductivityData[] = Array.from({ length: rangeDays }).map((_, i) => {
          const d = new Date(from.getTime() + i*24*60*60*1000)
          return { date: d.toISOString().slice(0,10), focus_time: 0, tasks_completed: 0, productivity_score: 0 }
        })
        setProductivityData(days)

        // Task distribution from current tasks
        const tRes = await fetch(`${API_URL}/tasks?teamId=${firstTeam.id}`, { headers: { Authorization: `Bearer ${token}` } })
        const tasks = await tRes.json()
        const counts = { DONE: 0, IN_PROGRESS: 0, PENDING: 0 }
        if (Array.isArray(tasks)) {
          for (const t of tasks) {
            if (t.status === 'DONE') counts.DONE++
            else if (t.status === 'IN_PROGRESS') counts.IN_PROGRESS++
            else counts.PENDING++
          }
        }
        setTaskDistribution([
          { status: 'Completed', count: counts.DONE, color: '#06D6A0' },
          { status: 'In Progress', count: counts.IN_PROGRESS, color: '#118AB2' },
          { status: 'To Do', count: counts.PENDING, color: '#FFD166' },
        ])

        // Weekly bars from productivity average
        setWeeklyStats([
          { week: 'This Week', team_productivity: Math.min(100, Math.round(((p?.totalFocusSeconds||0)/(7*3600))*100)), individual_productivity: Math.min(100, Math.round(((p?.avgFocusPerUser||0)/3600)*100)) }
        ])
        setTimeBreakdown([
          { category: 'Deep Work', hours: Math.round((p?.totalFocusSeconds||0)/3600), color: '#8B5CF6' },
          { category: 'Other', hours: 0, color: '#06D6A0' }
        ])

        // Update stats with real data
        const totalHours = Math.round((p?.totalFocusSeconds || 0) / 3600)
        const hours = Math.floor(totalHours)
        const minutes = Math.round(((p?.totalFocusSeconds || 0) % 3600) / 60)
        const focusTimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
        
        setStats({
          totalFocusTime: focusTimeStr,
          tasksCompleted: p?.tasksCompleted || 0,
          productivityScore: Math.min(100, Math.round(((p?.totalFocusSeconds || 0) / (7 * 3600)) * 100)),
          teamMembers: me?.teams?.[0]?.members?.length || 1
        })
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics()
  }, [selectedPeriod, API_URL, user])

  // Dynamic stats based on real data
  const [stats, setStats] = useState({
    totalFocusTime: '0h',
    tasksCompleted: 0,
    productivityScore: 0,
    teamMembers: 0
  });

  const statCards = [
    {
      title: 'Total Focus Time',
      value: stats.totalFocusTime,
      change: '+12%',
      icon: Clock,
      gradient: 'from-purple-500 to-indigo-600'
    },
    {
      title: 'Tasks Completed',
      value: stats.tasksCompleted.toString(),
      change: '+8%',
      icon: Target,
      gradient: 'from-teal-500 to-cyan-600'
    },
    {
      title: 'Productivity Score',
      value: `${stats.productivityScore}%`,
      change: '+5%',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-600'
    },
    {
      title: 'Team Members',
      value: stats.teamMembers.toString(),
      change: '+2',
      icon: Users,
      gradient: 'from-green-500 to-emerald-600'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white text-lg">Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-7xl mx-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl mb-2 bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <p className="text-gray-400">Track your team&apos;s productivity and performance</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 3 months</option>
                </select>
                
                <button className="bg-gradient-to-r from-purple-500 to-teal-500 px-6 py-2 rounded-lg hover:from-purple-600 hover:to-teal-600 transition-all duration-300 flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-sm text-green-400">{stat.change}</span>
                  </div>
                  <h3 className="text-2xl mb-1">{stat.value}</h3>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Productivity Trend */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
              >
                <h3 className="text-xl mb-6 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span>Productivity Trend</span>
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={productivityData}>
                    <defs>
                      <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                        border: '1px solid rgba(75, 85, 99, 0.3)',
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="productivity_score" 
                      stroke="#8B5CF6" 
                      fillOpacity={1} 
                      fill="url(#productivityGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Task Distribution */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
              >
                <h3 className="text-xl mb-6 flex items-center space-x-2">
                  <Target className="w-5 h-5 text-teal-400" />
                  <span>Task Distribution</span>
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      dataKey="count"
                      startAngle={90}
                      endAngle={450}
                    >
                      {taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                        border: '1px solid rgba(75, 85, 99, 0.3)',
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>

            {/* Additional Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weekly Performance */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
              >
                <h3 className="text-xl mb-6 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  <span>Weekly Performance</span>
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                        border: '1px solid rgba(75, 85, 99, 0.3)',
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="team_productivity" fill="#06D6A0" name="Team" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="individual_productivity" fill="#8B5CF6" name="Individual" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Time Breakdown */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
              >
                <h3 className="text-xl mb-6 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span>Time Breakdown</span>
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timeBreakdown} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#9CA3AF" />
                    <YAxis dataKey="category" type="category" stroke="#9CA3AF" width={100} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(31, 41, 55, 0.9)', 
                        border: '1px solid rgba(75, 85, 99, 0.3)',
                        borderRadius: '8px',
                        color: '#fff'
                      }} 
                    />
                    <Bar dataKey="hours" radius={[0, 4, 4, 0]}>
                      {timeBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </motion.div>
    </main>
  );
}