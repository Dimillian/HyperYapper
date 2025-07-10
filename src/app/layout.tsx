import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NotificationProvider } from '@/components/notifications'
import { Analytics } from '@vercel/analytics/react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HyperYapper ⚡💬',
  description: 'Unleash your inner chaos. Post everywhere at once. Maximum yapping efficiency for social media addicts.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'HyperYapper - Maximum Yapping Efficiency',
    description: 'Write once, yap everywhere. Threads, Mastodon, Bluesky.',
    url: 'https://www.hyperyapper.app',
    siteName: 'HyperYapper',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HyperYapper - Maximum Yapping Efficiency',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HyperYapper - Maximum Yapping Efficiency',
    description: 'Write once, yap everywhere. Threads, Mastodon, Bluesky.',
    images: ['/og-image.png'],
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
        <Analytics />
      </body>
    </html>
  )
}