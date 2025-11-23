"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/app/providers';
import { Bell, Check, Clock, Timer, Coffee, Target } from 'lucide-react';

export default function NotificationsPage() {
  const { notifications, markAllRead, unreadCount } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || !n.read
  );

  const getNotificationIcon = (title: string) => {
    if (title.includes('Focus') || title.includes('Timer')) return Timer;
    if (title.includes('Break')) return Coffee;
    if (title.includes('Task')) return Target;
    return Bell;
  };

  const getNotificationColor = (title: string) => {
    if (title.includes('Focus') || title.includes('Timer')) return 'text-blue-400';
    if (title.includes('Break')) return 'text-green-400';
    if (title.includes('Task')) return 'text-purple-400';
    return 'text-gray-400';
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="max-w-4xl mx-auto py-4 md:py-8">
      {/* Fix: Header - responsive layout */}
      <div className="px-4 md:px-6 pb-4 md:pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xl md:text-2xl font-bold text-white flex items-center"
            >
              <Bell className="w-5 h-5 md:w-6 md:h-6 mr-2 md:mr-3" />
              Notifications
            </motion.h1>
            <p className="text-gray-400 mt-1 text-sm md:text-base">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          {/* Fix: Filter buttons - responsive layout */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="flex bg-white/5 rounded-lg p-1">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}
              >
                All
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('unread')}
                className={filter === 'unread' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}
              >
                Unread
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white text-xs">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllRead}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Check className="w-4 h-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Fix: Notifications List - responsive padding */}
      <div className="px-4 md:px-6">
        {filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Bell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' 
                ? 'You\'re all caught up!' 
                : 'Start a focus session to receive notifications about your productivity.'
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification, index) => {
              const Icon = getNotificationIcon(notification.title);
              const iconColor = getNotificationColor(notification.title);
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Fix: Notification card - responsive layout */}
                  <Card className={`bg-black/40 backdrop-blur-xl border-white/10 hover:border-white/20 transition-all duration-300 ${
                    !notification.read ? 'ring-1 ring-blue-500/30' : ''
                  }`}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex items-start space-x-3 md:space-x-4">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 ${iconColor}`}>
                          <Icon className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className={`text-white font-medium text-sm md:text-base ${!notification.read ? 'font-semibold' : ''}`}>
                                {notification.title}
                              </h4>
                              {notification.body && (
                                <p className="text-gray-400 text-xs md:text-sm mt-1">
                                  {notification.body}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 sm:ml-4 flex-shrink-0">
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                              )}
                              <div className="flex items-center text-gray-500 text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTime(notification.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
