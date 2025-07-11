import { Bell, Trash2, ChevronRight, RefreshCw } from 'lucide-react'
import { NotificationCard } from './NotificationCard'
import { NotificationSidebarProps } from './types'
import { useNotifications } from './index'
import { useReplyFetching } from './useReplyFetching'

export function NotificationSidebar({ 
  notifications, 
  onDismiss, 
  onMarkAsRead, 
  onClearAll,
  isCollapsed,
  onToggleCollapse
}: NotificationSidebarProps) {
  const { updateNotificationReplyCounts } = useNotifications()
  const unreadCount = notifications.filter(n => !n.isRead).length
  
  // Use reply fetching hook to automatically fetch reply counts
  const { isFetching, manualRefresh } = useReplyFetching({
    notifications,
    onUpdateNotificationReplyCounts: updateNotificationReplyCounts,
    isVisible: !isCollapsed
  })

  return (
    <>
      {/* Fixed Action Buttons */}
      <div className="fixed top-20 right-4 flex gap-2 z-50">
        {/* Refresh Button - Only show when not collapsed and has posts */}
        {!isCollapsed && notifications.some(n => n.postIds && n.postIds.length > 0) && (
          <button
            onClick={manualRefresh}
            disabled={isFetching}
            className="w-10 h-10 bg-black/80 backdrop-blur-sm border border-purple-400/40 rounded-full flex items-center justify-center hover:bg-purple-500/20 transition-all duration-200 shadow-lg disabled:opacity-50"
            title="Refresh reply counts"
          >
            <RefreshCw className={`w-4 h-4 text-purple-300 ${isFetching ? 'animate-spin' : ''}`} />
          </button>
        )}
        
        {/* Close Button - Only show when sidebar is open */}
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="w-10 h-10 bg-black/80 backdrop-blur-sm border border-purple-400/40 rounded-full flex items-center justify-center hover:bg-purple-500/20 transition-all duration-200 shadow-lg"
            title="Close notifications"
          >
            <ChevronRight className="w-4 h-4 text-purple-300" />
          </button>
        )}
      </div>

      {/* Sidebar Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-black/40 backdrop-blur-sm border-l border-purple-400/20 flex flex-col transition-all duration-300 z-40 ${
        isCollapsed ? 'translate-x-full' : 'translate-x-0'
      }`}
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
            <div className="pt-20 px-4 pb-4 space-y-3">
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
    </>
  )
}