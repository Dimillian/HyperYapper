import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NotificationProvider } from '@/components/notifications'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HyperYapper ⚡💬',
  description: 'The ultimate social media posting app for yapping like a crazy motherfucker',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <NotificationProvider>
          <div className="min-h-screen bg-black text-white">
            {children}
          </div>
        </NotificationProvider>
      </body>
    </html>
  )
}