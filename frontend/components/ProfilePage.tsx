"use client"

import React, { useState } from 'react';
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import Sidebar from './Sidebar';
import { 
  User, 
  Mail, 
  Bell, 
  Shield, 
  Palette, 
  Clock, 
  Upload,
  Settings,
  Save,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Zap,
  TrendingUp,
  Target,
  Calendar
} from 'lucide-react';

type NavigateFunction = (page: 'landing' | 'auth' | 'dashboard' | 'tasks' | 'timer' | 'profile') => void;

interface ProfilePageProps {
  onNavigate: NavigateFunction;
  onLogout: () => void;
}

export default function ProfilePage({ onNavigate, onLogout }: ProfilePageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    taskAssignments: true,
    timerAlerts: true,
    teamUpdates: false,
    weeklyReports: true,
    emailDigest: true,
    pushNotifications: true
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    focusDuration: '25',
    breakDuration: '5',
    autoStartBreaks: false,
    soundEnabled: true,
    weekStartsOn: 'monday'
  });

  const stats = [
    { label: 'Total Focus Time', value: '147h 32m', icon: Clock, color: 'from-blue-500 to-cyan-600' },
    { label: 'Tasks Completed', value: '89', icon: Target, color: 'from-green-500 to-emerald-600' },
    { label: 'Productivity Score', value: '92%', icon: TrendingUp, color: 'from-purple-500 to-pink-600' },
    { label: 'Streak Days', value: '12', icon: Zap, color: 'from-orange-500 to-red-600' }
  ];

  const recentActivity = [
    { date: '2024-01-10', action: 'Completed task: Landing page redesign', duration: '2h 45m' },
    { date: '2024-01-10', action: 'Focus session: API documentation', duration: '1h 30m' },
    { date: '2024-01-09', action: 'Completed task: Bug fixes', duration: '3h 15m' },
    { date: '2024-01-09', action: 'Team meeting attendance', duration: '45m' },
    { date: '2024-01-08', action: 'Focus session: Code review', duration: '2h 00m' }
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0B0F17] via-[#0F1419] to-[#0B0F17]">
      <Sidebar currentPage="profile" onNavigate={onNavigate} onLogout={onLogout} />
      
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
                Profile & Settings
              </motion.h1>
              <p className="text-gray-400 mt-1">Manage your account and customize your RemoteZen experience.</p>
            </div>
            
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-black/40 border border-white/10">
                <TabsTrigger 
                  value="profile"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  Preferences
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white"
                >
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Profile Information */}
                  <div className="lg:col-span-2 space-y-6">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <User className="w-5 h-5 mr-2" />
                            Personal Information
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            Update your personal details and contact information
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Avatar Upload */}
                          <div className="flex items-center space-x-6">
                            <Avatar className="w-24 h-24">
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-600 text-white text-2xl">
                                JD
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Photo
                              </Button>
                              <p className="text-sm text-gray-400 mt-2">
                                JPG, PNG or GIF. Max size 2MB.
                              </p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="firstName" className="text-white">First Name</Label>
                              <Input
                                id="firstName"
                                defaultValue="John"
                                className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="lastName" className="text-white">Last Name</Label>
                              <Input
                                id="lastName"
                                defaultValue="Doe"
                                className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-white">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              defaultValue="john@example.com"
                              className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="title" className="text-white">Job Title</Label>
                            <Input
                              id="title"
                              defaultValue="Senior Frontend Developer"
                              className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="bio" className="text-white">Bio</Label>
                            <Textarea
                              id="bio"
                              placeholder="Tell us about yourself..."
                              className="bg-white/5 border-white/10 text-white placeholder-gray-400 min-h-[100px]"
                              defaultValue="Passionate frontend developer with 5+ years of experience building modern web applications. Love working with React, TypeScript, and design systems."
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>

                    {/* Security Settings */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Shield className="w-5 h-5 mr-2" />
                            Security
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            Manage your password and security settings
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="space-y-2">
                            <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                            <div className="relative">
                              <Input
                                id="currentPassword"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter current password"
                                className="bg-white/5 border-white/10 text-white placeholder-gray-400 pr-10"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="newPassword" className="text-white">New Password</Label>
                              <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                className="bg-white/5 border-white/10 text-white placeholder-gray-400"
                              />
                            </div>
                          </div>

                          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                            Update Password
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Stats Sidebar */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">Your Stats</CardTitle>
                        <CardDescription className="text-gray-400">
                          Your productivity overview
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {stats.map((stat, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                <stat.icon className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="text-white font-medium">{stat.value}</p>
                                <p className="text-gray-400 text-sm">{stat.label}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">Account Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Plan</span>
                          <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            Pro
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Member since</span>
                          <span className="text-white">Jan 2024</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-300">Team</span>
                          <span className="text-white">Design Team</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Preferences Tab */}
              <TabsContent value="preferences" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Settings className="w-5 h-5 mr-2" />
                          General Preferences
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-white">Theme</Label>
                            <p className="text-sm text-gray-400">Choose your preferred theme</p>
                          </div>
                          <Select value={preferences.theme} onValueChange={(value) => setPreferences({...preferences, theme: value})}>
                            <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/10">
                              <SelectItem value="dark">
                                <div className="flex items-center">
                                  <Moon className="w-4 h-4 mr-2" />
                                  Dark
                                </div>
                              </SelectItem>
                              <SelectItem value="light">
                                <div className="flex items-center">
                                  <Sun className="w-4 h-4 mr-2" />
                                  Light
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-white">Week starts on</Label>
                            <p className="text-sm text-gray-400">First day of the week</p>
                          </div>
                          <Select value={preferences.weekStartsOn} onValueChange={(value) => setPreferences({...preferences, weekStartsOn: value})}>
                            <SelectTrigger className="w-32 bg-white/5 border-white/10 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 border-white/10">
                              <SelectItem value="monday">Monday</SelectItem>
                              <SelectItem value="sunday">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-white">Sound Effects</Label>
                            <p className="text-sm text-gray-400">Timer and notification sounds</p>
                          </div>
                          <Switch
                            checked={preferences.soundEnabled}
                            onCheckedChange={(checked) => setPreferences({...preferences, soundEnabled: checked})}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Clock className="w-5 h-5 mr-2" />
                          Timer Settings
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-white">Focus Duration</Label>
                            <Select value={preferences.focusDuration} onValueChange={(value) => setPreferences({...preferences, focusDuration: value})}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black/90 border-white/10">
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="25">25 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="45">45 minutes</SelectItem>
                                <SelectItem value="60">60 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label className="text-white">Break Duration</Label>
                            <Select value={preferences.breakDuration} onValueChange={(value) => setPreferences({...preferences, breakDuration: value})}>
                              <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-black/90 border-white/10">
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="10">10 minutes</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="20">20 minutes</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Label className="text-white">Auto-start breaks</Label>
                            <p className="text-sm text-gray-400">Automatically start break timer</p>
                          </div>
                          <Switch
                            checked={preferences.autoStartBreaks}
                            onCheckedChange={(checked) => setPreferences({...preferences, autoStartBreaks: checked})}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>

              {/* Notifications Tab */}
              <TabsContent value="notifications" className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Bell className="w-5 h-5 mr-2" />
                        Notification Preferences
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Choose which notifications you want to receive
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="font-medium text-white">App Notifications</h4>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="text-white">Task Assignments</Label>
                              <p className="text-sm text-gray-400">When someone assigns you a task</p>
                            </div>
                            <Switch
                              checked={notifications.taskAssignments}
                              onCheckedChange={(checked) => setNotifications({...notifications, taskAssignments: checked})}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="text-white">Timer Alerts</Label>
                              <p className="text-sm text-gray-400">Focus and break timer notifications</p>
                            </div>
                            <Switch
                              checked={notifications.timerAlerts}
                              onCheckedChange={(checked) => setNotifications({...notifications, timerAlerts: checked})}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="text-white">Team Updates</Label>
                              <p className="text-sm text-gray-400">When team members complete tasks</p>
                            </div>
                            <Switch
                              checked={notifications.teamUpdates}
                              onCheckedChange={(checked) => setNotifications({...notifications, teamUpdates: checked})}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-medium text-white">Email & Push</h4>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="text-white">Weekly Reports</Label>
                              <p className="text-sm text-gray-400">Weekly productivity summary</p>
                            </div>
                            <Switch
                              checked={notifications.weeklyReports}
                              onCheckedChange={(checked) => setNotifications({...notifications, weeklyReports: checked})}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="text-white">Email Digest</Label>
                              <p className="text-sm text-gray-400">Daily email with task updates</p>
                            </div>
                            <Switch
                              checked={notifications.emailDigest}
                              onCheckedChange={(checked) => setNotifications({...notifications, emailDigest: checked})}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <Label className="text-white">Push Notifications</Label>
                              <p className="text-sm text-gray-400">Browser push notifications</p>
                            </div>
                            <Switch
                              checked={notifications.pushNotifications}
                              onCheckedChange={(checked) => setNotifications({...notifications, pushNotifications: checked})}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            Recent Activity
                          </CardTitle>
                          <CardDescription className="text-gray-400">
                            Your recent focus sessions and completed tasks
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {recentActivity.map((activity, index) => (
                              <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                                <div className="flex-1">
                                  <p className="text-white text-sm">{activity.action}</p>
                                  <p className="text-gray-400 text-xs mt-1">{activity.date}</p>
                                </div>
                                <Badge variant="outline" className="border-white/20 text-gray-400">
                                  {activity.duration}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="bg-black/40 backdrop-blur-xl border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white">This Week</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white mb-1">32h 15m</div>
                          <p className="text-gray-400 text-sm">Total Focus Time</p>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Monday</span>
                            <span className="text-white">6h 30m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Tuesday</span>
                            <span className="text-white">5h 45m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Wednesday</span>
                            <span className="text-white">7h 20m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Thursday</span>
                            <span className="text-white">6h 15m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Friday</span>
                            <span className="text-white">6h 25m</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}