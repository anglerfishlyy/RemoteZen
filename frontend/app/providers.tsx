"use client"

import { useSession, signOut } from "next-auth/react"
import { useNotifications } from "@/lib/notifications-provider"

export function useAuth() {
  const session = useSession()
  const { addNotification } = useNotifications()

  return {
    user: session.data?.user,
    isAuthenticated: !!session.data?.user,
    addNotification,
    logout: () => signOut({ callbackUrl: "/login" }),
  }
}

export { useNotifications } from "@/lib/notifications-provider"

