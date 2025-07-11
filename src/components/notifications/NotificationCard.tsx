import { X, CheckCircle, AlertCircle, ExternalLink, Clock, MessageCircle, Loader2 } from 'lucide-react'
import { SiThreads, SiMastodon, SiBluesky } from 'react-icons/si'
import { Notification, ReplyCount } from './types'

interface NotificationCardProps {
  notification: Notification
  onDismiss: (id: string) => void
  onMarkAsRead: (id: string) => void
}

export function NotificationCard({ notification, onDismiss, onMarkAsRead }: NotificationCardProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
  }

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Clock className="w-4 h-4 text-blue-400" />
    }
  }

  const getTypeColor = () => {
    switch (notification.type) {
      case 'success':
        return 'border-green-500/30 bg-green-900/10'
      case 'error':
        return 'border-red-500/30 bg-red-900/10'
      default:
        return 'border-blue-500/30 bg-blue-900/10'
    }
  }

  const getStatusIcon = (status?: string, success?: boolean) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3 h-3 text-yellow-400" />
      case 'posting':
        return <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-400" />
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-400" />
      default:
        // Fallback to old behavior
        return success ? <CheckCircle className="w-3 h-3 text-green-400" /> : <AlertCircle className="w-3 h-3 text-red-400" />
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'mastodon':
        return <SiMastodon className="w-3 h-3 text-[#6364FF]" />
      case 'threads':
        return <SiThreads className="w-3 h-3 text-white" />
      case 'bluesky':
        return <SiBluesky className="w-3 h-3 text-[#00A8E8]" />
      default:
        return <CheckCircle className="w-3 h-3 text-green-400" />
    }
  }

  const getReplyCount = (platform: string): ReplyCount | undefined => {
    return notification.replyCounts?.find(rc => rc.platform === platform)
  }

  return (
    <div
      className={`p-3 rounded-lg border backdrop-blur-sm transition-all duration-200 ${getTypeColor()} ${
        !notification.isRead ? 'ring-1 ring-purple-400/20' : ''
      }`}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
      suppressHydrationWarning={true}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1">
          {getTypeIcon()}
          <div className="flex-1 min-w-0">
            {notification.type === 'success' ? (
              // Success notifications: only show time and unread indicator
              <div className="flex items-center gap-2">
                <span className="text-xs text-purple-400/60">
                  {formatTime(notification.timestamp)}
                </span>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0" />
                )}
              </div>
            ) : (
              // Error notifications: show full title and message
              <>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-purple-100 truncate">
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-purple-300/80 mt-1">
                  {notification.message}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-purple-400/60">
                    {formatTime(notification.timestamp)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDismiss(notification.id)
          }}
          className="p-1 hover:bg-purple-500/20 rounded transition-colors duration-150"
        >
          <X className="w-3 h-3 text-purple-400/60 hover:text-purple-300" />
        </button>
      </div>

      {/* Post Preview */}
      {notification.originalPost && (
        <div className="mt-2 p-2 bg-black/20 rounded border border-purple-400/10">
          <div className="text-xs text-purple-300/80 font-medium mb-1">Original Post:</div>
          <div className="text-xs text-purple-200 leading-relaxed whitespace-pre-wrap">
            {notification.originalPost.truncatedPreview}</div>
        </div>
      )}

      {/* Post Results */}
      {notification.postResults && notification.postResults.length > 0 && (
        <div className="mt-3 space-y-2">
          {notification.postResults.map((result, index) => (
            <div
              key={index}
              className="p-2 bg-black/20 rounded border border-purple-400/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {getPlatformIcon(result.platform)}
                    {getStatusIcon(result.status, result.success)}
                  </div>
                  <span className="text-xs text-purple-200 capitalize flex-shrink-0">
                    {result.platform}
                  </span>
                  
                  {/* Reply count badge */}
                  {result.success && (() => {
                    const replyCount = getReplyCount(result.platform)
                    if (replyCount && replyCount.count > 0) {
                      return (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-500/20 rounded text-xs flex-shrink-0">
                          <MessageCircle className="w-2.5 h-2.5 text-purple-300" />
                          <span className={`text-purple-200 font-medium ${replyCount.hasUnread ? 'text-green-300' : ''}`}>
                            {replyCount.count}
                          </span>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
                {result.postUrl && result.success && (
                  <a
                    href={result.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-purple-300 hover:text-purple-200 transition-colors flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink className="w-3 h-3" />
                    View
                  </a>
                )}
              </div>
              
              {/* Error message below service name - full width */}
              {result.error && (
                <div className="mt-2 text-xs text-red-300 leading-relaxed break-words">
                  {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}