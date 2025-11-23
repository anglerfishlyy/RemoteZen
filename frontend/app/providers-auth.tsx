'use client'

import React, { ReactNode } from 'react'
import { SessionProvider } from 'next-auth/react'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider
      // Fix: Refresh session on window focus to ensure fresh data
      refetchOnWindowFocus={true}
      // Fix: Refetch interval to keep session fresh
      refetchInterval={60} // Refetch every 60 seconds
    >
      {children}
    </SessionProvider>
  )
}
