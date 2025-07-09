import { CheckCircle, LogOut, Plus } from 'lucide-react'
import { FaXTwitter } from 'react-icons/fa6'
import { SiThreads, SiMastodon, SiBluesky } from 'react-icons/si'
import { AccountCardProps } from './types'

const platformConfig = {
  mastodon: {
    name: 'Mastodon',
    icon: SiMastodon,
    iconColor: 'text-[#6364FF]',
    iconShadow: 'drop-shadow-[0_0_4px_rgba(99,100,255,0.6)]'
  },
  threads: {
    name: 'Threads',
    icon: SiThreads,
    iconColor: 'text-white',
    iconShadow: 'drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]'
  },
  x: {
    name: 'X (Twitter)',
    icon: FaXTwitter,
    iconColor: 'text-gray-400',
    iconShadow: ''
  },
  bluesky: {
    name: 'BlueSky',
    icon: SiBluesky,
    iconColor: 'text-[#00A8E8]',
    iconShadow: 'drop-shadow-[0_0_4px_rgba(0,168,232,0.6)]'
  }
}

export function AccountCard({ platform, isConnected, session, onConnect, onDisconnect }: AccountCardProps) {
  const config = platformConfig[platform]
  const Icon = config.icon
  const isComingSoon = platform === 'x'

  const getUserInfo = () => {
    if (!session) return null
    
    if (platform === 'mastodon') {
      return {
        username: `@${session.username}@${new URL(session.instance).hostname}`,
        displayName: session.displayName
      }
    }
    
    if (platform === 'threads') {
      return {
        username: `@${session.userInfo.username}`,
        displayName: session.userInfo.name
      }
    }
    
    if (platform === 'bluesky') {
      return {
        username: `@${session.handle}`,
        displayName: session.handle
      }
    }
    
    return null
  }

  const userInfo = getUserInfo()

  return (
    <div className={`flex items-center justify-between p-3 bg-black/60 rounded-lg border border-purple-400/20 ${
      isComingSoon ? 'opacity-60' : ''
    }`}>
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${config.iconColor} ${config.iconShadow}`} />
        <div>
          <div className="font-medium text-purple-100 text-sm">{config.name}</div>
          {isConnected && userInfo ? (
            <div className="flex items-center gap-1 text-xs text-purple-200/80">
              <CheckCircle className="w-3 h-3 text-green-300 drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]" />
              <span>{userInfo.username}</span>
            </div>
          ) : (
            <div className="text-xs text-gray-300">
              {isComingSoon ? 'Coming soon' : 'Not connected'}
            </div>
          )}
        </div>
      </div>

      {isConnected ? (
        <button
          onClick={onDisconnect}
          className="p-1 text-purple-300 hover:text-red-300 transition-colors"
          title="Disconnect"
        >
          <LogOut className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={onConnect}
          disabled={isComingSoon}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
            isComingSoon 
              ? 'bg-gray-600/60 text-gray-400 cursor-not-allowed'
              : 'bg-purple-500/30 hover:bg-purple-500/40 text-purple-100 neon-glow'
          }`}
        >
          <Plus className="w-3 h-3" />
          {isComingSoon ? 'Soon' : 'Connect'}
        </button>
      )}
    </div>
  )
}