import { Notification } from './types'

const STORAGE_KEY = 'hyperyapper_notifications'

export class NotificationStorage {
  private static isClient = typeof window !== 'undefined'

  static save(notifications: Notification[]): void {
    if (!this.isClient) return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    } catch (error) {
      console.warn('Failed to save notifications to localStorage:', error)
    }
  }

  static load(): Notification[] {
    if (!this.isClient) return []
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []
      
      const notifications = JSON.parse(stored) as Notification[]
      
      // Validate and filter out invalid notifications
      return notifications.filter(this.isValidNotification)
    } catch (error) {
      console.warn('Failed to load notifications from localStorage:', error)
      return []
    }
  }

  static clear(): void {
    if (!this.isClient) return
    
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear notifications from localStorage:', error)
    }
  }

  private static isValidNotification(notification: any): notification is Notification {
    return (
      typeof notification === 'object' &&
      notification !== null &&
      typeof notification.id === 'string' &&
      typeof notification.timestamp === 'number' &&
      typeof notification.type === 'string' &&
      ['success', 'error', 'info'].includes(notification.type) &&
      typeof notification.title === 'string' &&
      typeof notification.message === 'string' &&
      (notification.isRead === undefined || typeof notification.isRead === 'boolean') &&
      (notification.postResults === undefined || Array.isArray(notification.postResults))
    )
  }
}