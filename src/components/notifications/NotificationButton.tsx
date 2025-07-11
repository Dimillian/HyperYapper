import { Bell } from 'lucide-react'

interface NotificationButtonProps {
  unreadCount: number
  onClick: () => void
}

export function NotificationButton({ unreadCount, onClick }: NotificationButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-10 h-10 flex items-center justify-center bg-purple-500/30 hover:bg-purple-500/40 border border-purple-300/50 rounded-full transition-all duration-200 neon-glow hover:neon-glow-strong ${
        unreadCount > 0 ? 'animate-pulse' : ''
      }`}
      title="Notifications"
    >
      <Bell className="w-5 h-5 text-purple-300" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}