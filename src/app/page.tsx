'use client'

import { useState, useEffect, useRef } from 'react'
import { PostEditor } from '@/components/postComposer'
import { AccountDropdown } from '@/components/accountDropdown'
import Footer from '@/components/Footer'
import { NotificationSidebar, useNotifications } from '@/components/notifications'
import { useOAuthCallback } from '@/hooks/useOAuthCallback'
import { HyperYapperIcon } from '@/components/icons/HyperYapperIcon'

const TAGLINES = [
  "Cross-Post Like a Legend",
  "Yap Across the Multiverse",
  "One Post to Rule Them All",
  "Maximum Yapping Efficiency",
  "Social Media Speed Runner",
  "Professional Yapper Tools",
  "Chaos Coordinator for Your Posts",
  "The Yapping Olympics Champion",
  "Multi-Platform Mayhem Maker",
  "Your Posts, Everywhere, All at Once",
  "Broadcast Your Brilliance",
  "Triple Threat Posting",
  "Social Media Speedrun Mode",
  "The Ultimate Yap Machine",
  "Omnipresent Posting Power"
]

export default function Home() {
  const { notifications, dismissNotification, markAsRead, clearAll } = useNotifications()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true)
  const [currentTagline, setCurrentTagline] = useState(TAGLINES[0])
  
  // Handle OAuth callbacks
  useOAuthCallback()
  
  // Set random tagline on component mount
  useEffect(() => {
    const randomTagline = TAGLINES[Math.floor(Math.random() * TAGLINES.length)]
    setCurrentTagline(randomTagline)
  }, [])
  
  // Track the previous notification count and initial load
  const prevNotificationCountRef = useRef(notifications.length)
  const isInitialLoadRef = useRef(true)
  
  // Open sidebar when new notification is added (but not on initial load)
  useEffect(() => {
    const currentCount = notifications.length
    const prevCount = prevNotificationCountRef.current
    const unreadCount = notifications.filter(n => !n.isRead).length
    
    // Skip auto-open on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      prevNotificationCountRef.current = currentCount
      return
    }
    
    // If notification count increased and there are unread notifications, open the sidebar
    if (currentCount > prevCount && unreadCount > 0 && isSidebarCollapsed) {
      setIsSidebarCollapsed(false)
    }
    
    // Update the ref for next comparison
    prevNotificationCountRef.current = currentCount
  }, [notifications.length, notifications, isSidebarCollapsed])
  
  // Mark all notifications as read when sidebar is open
  useEffect(() => {
    if (!isSidebarCollapsed) {
      // Small delay to allow the sidebar animation to start
      const timer = setTimeout(() => {
        notifications.forEach(n => {
          if (!n.isRead) {
            markAsRead(n.id)
          }
        })
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [isSidebarCollapsed, notifications, markAsRead])
  
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
                {currentTagline}
              </h2>
              <p className="text-purple-200 text-lg font-medium glow-text">
                Write once, yap everywhere. Threads, Mastodon, Bluesky.
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