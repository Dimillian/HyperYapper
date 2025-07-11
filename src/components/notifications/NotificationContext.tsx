'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { Notification, NotificationContextType, ReplyCount } from './types'
import { NotificationStorage } from './notificationStorage'

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = NotificationStorage.load()
    setNotifications(savedNotifications)
    setIsHydrated(true)
  }, [])

  // Save notifications to localStorage whenever they change (but only after hydration)
  useEffect(() => {
    if (isHydrated) {
      NotificationStorage.save(notifications)
    }
  }, [notifications, isHydrated])

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      isRead: false
    }
    
    setNotifications(prev => [newNotification, ...prev])
    return newNotification
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const notificationToRemove = prev.find(n => n.id === id)
      
      // Clear reply cache for this notification's posts
      if (notificationToRemove?.postIds) {
        import('@/lib/storage/replyCache').then(({ ReplyCache }) => {
          const cache = ReplyCache.getInstance()
          cache.clearPostCaches(notificationToRemove.postIds!.map(postId => ({
            platform: postId.platform,
            postId: postId.postId
          })))
        })
      }
      
      return prev.filter(n => n.id !== id)
    })
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }, [])

  const clearAll = useCallback(() => {
    setNotifications(prev => {
      // Clear reply cache for all notifications
      const allPostIds = prev
        .filter(n => n.postIds)
        .flatMap(n => n.postIds!.map(postId => ({
          platform: postId.platform,
          postId: postId.postId
        })))
      
      if (allPostIds.length > 0) {
        import('@/lib/storage/replyCache').then(({ ReplyCache }) => {
          const cache = ReplyCache.getInstance()
          cache.clearPostCaches(allPostIds)
        })
      }
      
      return []
    })
  }, [])

  const updateNotificationReplyCounts = useCallback((notificationId: string, replyCounts: ReplyCount[]) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, replyCounts } : n)
    )
  }, [])

  const updateNotification = useCallback((id: string, updates: Partial<Notification>) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, ...updates } : n)
    )
  }, [])

  const value: NotificationContextType = {
    notifications,
    addNotification,
    dismissNotification,
    markAsRead,
    clearAll,
    updateNotificationReplyCounts,
    updateNotification
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}