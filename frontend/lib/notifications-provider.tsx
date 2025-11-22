"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type NotificationType = "info" | "success" | "warning" | "error";

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  type: NotificationType;
  read: boolean;
  createdAt: number;
}

interface NotificationsContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (input: {
    title: string;
    body?: string;
    type?: NotificationType;
  }) => void;
  markAllRead: () => void;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

const NotificationsContext = createContext<
  NotificationsContextValue | undefined
>(undefined);

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 11);
};

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: createId(),
    title: "Welcome to RemoteZen 👋",
    body: "Stay focused with live analytics, timers, and team workflows.",
    type: "info",
    read: false,
    createdAt: Date.now(),
  },
];

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );

  const addNotification = useCallback<
    NotificationsContextValue["addNotification"]
  >(({ title, body, type = "info" }) => {
    setNotifications((prev) => [
      {
        id: createId(),
        title,
        body,
        type,
        read: false,
        createdAt: Date.now(),
      },
      ...prev,
    ]);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = useMemo<NotificationsContextValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((n) => !n.read).length,
      addNotification,
      markAllRead,
      markAsRead,
      removeNotification,
      clearNotifications,
    }),
    [notifications, addNotification, markAllRead, markAsRead, removeNotification, clearNotifications]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}





