export interface Notification {
  id: string
  timestamp: number
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  postResults?: PostResult[]
  isRead?: boolean
}

export interface PostResult {
  platform: string
  success: boolean
  postId?: string
  postUrl?: string
  error?: string
}

export interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  dismissNotification: (id: string) => void
  markAsRead: (id: string) => void
  clearAll: () => void
}

export interface NotificationSidebarProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  onMarkAsRead: (id: string) => void
  onClearAll: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}