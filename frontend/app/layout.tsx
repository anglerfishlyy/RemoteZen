import './globals.css'
import { Providers } from './providers'
import SiteLayout from '@/components/SiteLayout'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <SiteLayout>
            {children}
          </SiteLayout>
        </Providers>
      </body>
    </html>
  )
}
