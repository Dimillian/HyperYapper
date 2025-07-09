'use client'

import { useState, useEffect } from 'react'
import { PostEditor } from '@/components/postComposer'
import { AccountDropdown } from '@/components/accountDropdown'
import Footer from '@/components/Footer'
import { NotificationSidebar, useNotifications } from '@/components/notifications'
import { BlueSkyAuth } from '@/lib/auth/bluesky'
import { Zap, MessageCircle } from 'lucide-react'

export default function Home() {
  const { notifications, dismissNotification, markAsRead, clearAll } = useNotifications()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  useEffect(() => {
    // Handle OAuth callback parameters
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const iss = urlParams.get('iss')
      
      // Check if this is a BlueSky OAuth callback
      if (code && state && iss === 'https://bsky.social') {
        try {
          const session = await BlueSkyAuth.handleCallback(urlParams)
          if (session) {
            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname)
            // Trigger session change event
            window.dispatchEvent(new CustomEvent('sessionChanged'))
          }
        } catch (error) {
          console.error('Error handling BlueSky callback:', error)
        }
      }
    }
    
    handleOAuthCallback()
  }, [])
  
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-purple-300/40 bg-black/90 backdrop-blur-md sticky top-0 z-50 bright-glow">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Zap className="w-8 h-8 text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                <MessageCircle className="w-6 h-6 text-purple-300 drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
              </div>
              <h1 className="text-2xl font-bold cyberpunk-text">HyperYapper</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-sm glow-text font-medium">
                Ready to yap like a pro? ⚡
              </div>
              <AccountDropdown />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative">
        {/* Main Content */}
        <main className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold cyberpunk-text">
                Cross-Post Like a Legend
              </h2>
              <p className="text-purple-200 text-lg font-medium glow-text">
                Write once, yap everywhere. X, Threads, Mastodon, BlueSky.
              </p>
            </div>

            {/* Post Editor */}
            <PostEditor />
          </div>
        </main>

        {/* Notification Sidebar */}
        <NotificationSidebar
          notifications={notifications}
          onDismiss={dismissNotification}
          onMarkAsRead={markAsRead}
          onClearAll={clearAll}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}