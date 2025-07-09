import { Bell, Trash2, Check } from 'lucide-react'
import { NotificationCard } from './NotificationCard'
import { Notification } from './types'

interface NotificationSidebarProps {
  notifications: Notification[]
  onDismiss: (id: string) => void
  onMarkAsRead: (id: string) => void
  onClearAll: () => void
}

export function NotificationSidebar({ 
  notifications, 
  onDismiss, 
  onMarkAsRead, 
  onClearAll 
}: NotificationSidebarProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="w-80 h-full bg-black/40 backdrop-blur-sm border-l border-purple-400/20 flex flex-col"
         suppressHydrationWarning={true}>
      {/* Header */}
      <div className="p-4 border-b border-purple-400/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-300" />
            <h2 className="text-lg font-semibold text-purple-100">
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs bg-purple-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => notifications.forEach(n => !n.isRead && onMarkAsRead(n.id))}
                className="p-1 hover:bg-purple-500/20 rounded transition-colors duration-150"
                title="Mark all as read"
              >
                <Check className="w-4 h-4 text-purple-300" />
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="p-1 hover:bg-purple-500/20 rounded transition-colors duration-150"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4 text-purple-300" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <Bell className="w-12 h-12 text-purple-400/40 mb-4" />
            <h3 className="text-lg font-medium text-purple-200 mb-2">
              No notifications yet
            </h3>
            <p className="text-sm text-purple-400/60">
              Your post notifications will appear here
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {notifications
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onDismiss={onDismiss}
                  onMarkAsRead={onMarkAsRead}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  )
}