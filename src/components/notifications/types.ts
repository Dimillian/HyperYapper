export interface Notification {
  id: string
  timestamp: number
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  postResults?: PostResult[]
  isRead?: boolean
  originalPost?: OriginalPost
  postIds?: PostReference[]
  replyCounts?: ReplyCount[]
}

export interface OriginalPost {
  content: string
  truncatedPreview: string
}

export interface PostReference {
  platform: string
  postId: string
  postUri?: string // For Bluesky AT-URI
}

export interface ReplyCount {
  platform: string
  count: number
  lastFetched: number
  hasUnread: boolean
}

export interface PostResult {
  platform: string
  success: boolean
  postId?: string
  postUrl?: string
  error?: string
  status?: 'pending' | 'posting' | 'completed' | 'failed'
}

export interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => Notification
  dismissNotification: (id: string) => void
  markAsRead: (id: string) => void
  clearAll: () => void
  updateNotificationReplyCounts: (notificationId: string, replyCounts: ReplyCount[]) => void
  updateNotification: (id: string, updates: Partial<Notification>) => void
}

export interface NotificationSidebarProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  onMarkAsRead: (id: string) => void
  onClearAll: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}