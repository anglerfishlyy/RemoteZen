import './globals.css'
import { Providers } from './providers-auth'
import { NotificationsProvider } from '@/lib/notifications-provider'
import SiteLayout from '@/components/SiteLayout'

export const metadata = {
  title: 'RemoteZen',
  description: 'Remote team focus and productivity management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <NotificationsProvider>
            <SiteLayout>
              {children}
            </SiteLayout>
          </NotificationsProvider>
        </Providers>
      </body>
    </html>
  )
}
