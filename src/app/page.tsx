'use client'

import { useState } from 'react'
import { PostEditor } from '@/components/postComposer'
import { AccountDropdown } from '@/components/accountDropdown'
import Footer from '@/components/Footer'
import { NotificationSidebar, useNotifications } from '@/components/notifications'
import { useOAuthCallback } from '@/hooks/useOAuthCallback'
import { HyperYapperIcon } from '@/components/icons/HyperYapperIcon'

export default function Home() {
  const { notifications, dismissNotification, markAsRead, clearAll } = useNotifications()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  
  // Handle OAuth callbacks
  useOAuthCallback()
  
  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Header */}
      <header className="border-b border-purple-300/40 bg-black/90 backdrop-blur-md sticky top-0 z-50 bright-glow">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HyperYapperIcon 
                size={36} 
                className="text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] -mb-1" 
              />
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