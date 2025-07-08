'use client'

import { Platform } from '@/types/platform'
import { FaXTwitter } from 'react-icons/fa6'
import { SiThreads, SiMastodon, SiBluesky } from 'react-icons/si'

interface PlatformButtonProps {
  platform: Platform
  isSelected: boolean
  isConnected: boolean
  onClick: (platformId: string) => void
}

const getPlatformIcon = (platformId: string) => {
  const iconProps = { className: "w-4 h-4" }
  
  switch (platformId) {
    case 'twitter':
      return <FaXTwitter {...iconProps} />
    case 'threads':
      return <SiThreads {...iconProps} />
    case 'mastodon':
      return <SiMastodon {...iconProps} />
    case 'bluesky':
      return <SiBluesky {...iconProps} />
    default:
      return null
  }
}

export function PlatformButton({ platform, isSelected, isConnected, onClick }: PlatformButtonProps) {
  const Icon = getPlatformIcon(platform.id)
  
  const getButtonStyles = () => {
    if (isSelected) {
      return {
        className: 'bg-purple-500/30 border-purple-300/70 text-purple-100 font-medium',
        style: {
          boxShadow: `0 0 20px ${platform.glowColor}, 0 0 30px ${platform.glowColor}50`
        }
      }
    }
    
    if (isConnected) {
      return {
        className: 'bg-black/50 border-purple-400/30 text-purple-200 hover:border-purple-300/50 hover:bg-purple-500/10',
        style: {}
      }
    }
    
    return {
      className: 'bg-black/20 border-gray-600/50 text-gray-500 hover:border-gray-500/70 cursor-pointer',
      style: {}
    }
  }
  
  const getIconStyles = () => {
    if (isSelected) {
      return {
        color: platform.brandColor,
        filter: `drop-shadow(0 0 6px ${platform.glowColor})`
      }
    }
    
    if (isConnected) {
      return {
        color: platform.brandColor,
        opacity: 0.8
      }
    }
    
    return {
      color: '#9CA3AF' // gray-400
    }
  }
  
  const buttonStyles = getButtonStyles()
  const iconStyles = getIconStyles()
  
  return (
    <button
      onClick={() => onClick(platform.id)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${buttonStyles.className}`}
      style={buttonStyles.style}
    >
      <div style={iconStyles}>
        {Icon}
      </div>
      <span className="text-sm">{platform.name}</span>
    </button>
  )
}