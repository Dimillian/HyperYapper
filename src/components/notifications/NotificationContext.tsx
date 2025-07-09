'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { Notification, NotificationContextType } from './types'
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
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const value: NotificationContextType = {
    notifications,
    addNotification,
    dismissNotification,
    markAsRead,
    clearAll
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