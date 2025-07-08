'use client'

import { useState, useEffect, useCallback } from 'react'
import { SessionManager } from '@/lib/storage/sessionStorage'
import { 
  Send, 
  Image, 
  Smile, 
  Hash, 
  AtSign, 
  Wand2,
  Twitter,
  Instagram,
  Globe,
  Zap
} from 'lucide-react'

const PLATFORM_LIMITS = {
  twitter: 280,
  threads: 500,
  mastodon: 500,
  bluesky: 300
}

const PLATFORMS = [
  { id: 'twitter', name: 'X', icon: Twitter, color: 'text-blue-400', limit: PLATFORM_LIMITS.twitter },
  { id: 'threads', name: 'Threads', icon: Instagram, color: 'text-pink-400', limit: PLATFORM_LIMITS.threads },
  { id: 'mastodon', name: 'Mastodon', icon: Globe, color: 'text-indigo-400', limit: PLATFORM_LIMITS.mastodon },
  { id: 'bluesky', name: 'BlueSky', icon: Zap, color: 'text-sky-400', limit: PLATFORM_LIMITS.bluesky }
]

export function PostEditor() {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])

  const refreshConnectedPlatforms = useCallback(() => {
    const sessionManager = SessionManager.getInstance()
    const connected = sessionManager.getConnectedPlatforms()
    setConnectedPlatforms(connected)
    
    // Update selected platforms to only include connected ones
    setSelectedPlatforms(prev => prev.filter(platform => connected.includes(platform)))
    
    // Auto-select connected platforms if none are selected
    if (connected.length > 0 && selectedPlatforms.length === 0) {
      setSelectedPlatforms(connected)
    }
  }, [selectedPlatforms])

  useEffect(() => {
    refreshConnectedPlatforms()
  }, [refreshConnectedPlatforms])

  useEffect(() => {
    // Listen for session changes from other components
    const handleSessionChange = () => {
      refreshConnectedPlatforms()
    }

    window.addEventListener('sessionChanged', handleSessionChange)
    return () => window.removeEventListener('sessionChanged', handleSessionChange)
  }, [refreshConnectedPlatforms])

  const handlePlatformToggle = (platformId: string) => {
    // If platform is not connected, open account dropdown
    if (!connectedPlatforms.includes(platformId)) {
      window.dispatchEvent(new CustomEvent('openAccountDropdown'))
      return
    }
    
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    )
  }

  const getCharacterLimit = () => {
    if (selectedPlatforms.length === 0) return 280
    return Math.min(...selectedPlatforms.map(id => PLATFORM_LIMITS[id as keyof typeof PLATFORM_LIMITS]))
  }

  const currentLimit = getCharacterLimit()
  const remaining = currentLimit - content.length
  const isOverLimit = remaining < 0

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="glass-card p-6 space-y-4">
        {/* Platform Selection */}
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(platform => {
            const Icon = platform.icon
            const isSelected = selectedPlatforms.includes(platform.id)
            const isConnected = connectedPlatforms.includes(platform.id)
            
            return (
              <button
                key={platform.id}
                onClick={() => handlePlatformToggle(platform.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-purple-500/30 border-purple-300/70 text-purple-100 neon-glow font-medium' 
                    : isConnected
                    ? 'bg-black/50 border-purple-400/30 text-purple-200 hover:border-purple-300/50 hover:bg-purple-500/10'
                    : 'bg-black/20 border-gray-600/50 text-gray-500 hover:border-gray-500/70 cursor-pointer'
                }`}
              >
                <Icon className={`w-4 h-4 ${
                  isSelected ? `${platform.color} drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]` : 
                  isConnected ? 'text-purple-300' : 'text-gray-600'
                }`} />
                <span className="text-sm">{platform.name}</span>
              </button>
            )
          })}
        </div>

        {/* Text Editor */}
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="What's happening? Time to yap..."
            className={`w-full bg-black/70 border border-purple-400/40 rounded-lg p-4 text-purple-100 placeholder-purple-300/50 resize-none transition-all duration-200 focus:border-purple-300/70 focus:bg-black/80 focus:shadow-[0_0_20px_rgba(168,85,247,0.3)] ${
              isExpanded ? 'h-32' : 'h-20'
            } ${isOverLimit ? 'border-red-400/70 focus:border-red-400/70' : ''}`}
          />
          
          {/* Character Counter */}
          <div className="absolute bottom-2 right-2 text-sm font-medium">
            <span className={`${
              isOverLimit ? 'text-red-300 drop-shadow-[0_0_4px_rgba(239,68,68,0.6)]' : 
              remaining < 20 ? 'text-yellow-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]' : 
              'text-purple-300 drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]'
            }`}>
              {remaining}
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-black/50 border border-purple-400/30 hover:border-purple-300/50 hover:bg-purple-500/10 transition-all duration-200">
              <Image className="w-5 h-5 text-purple-300 hover:text-purple-200" />
            </button>
            <button className="p-2 rounded-lg bg-black/50 border border-purple-400/30 hover:border-purple-300/50 hover:bg-purple-500/10 transition-all duration-200">
              <Smile className="w-5 h-5 text-purple-300 hover:text-purple-200" />
            </button>
            <button className="p-2 rounded-lg bg-black/50 border border-purple-400/30 hover:border-purple-300/50 hover:bg-purple-500/10 transition-all duration-200">
              <Hash className="w-5 h-5 text-purple-300 hover:text-purple-200" />
            </button>
            <button className="p-2 rounded-lg bg-black/50 border border-purple-400/30 hover:border-purple-300/50 hover:bg-purple-500/10 transition-all duration-200">
              <AtSign className="w-5 h-5 text-purple-300 hover:text-purple-200" />
            </button>
            <button className="p-2 rounded-lg bg-black/50 border border-purple-400/30 hover:border-purple-300/50 hover:bg-purple-500/10 transition-all duration-200">
              <Wand2 className="w-5 h-5 text-purple-300 hover:text-purple-200" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Platform Indicators */}
            <div className="flex items-center gap-1">
              {selectedPlatforms.map(platformId => {
                const platform = PLATFORMS.find(p => p.id === platformId)
                if (!platform) return null
                const Icon = platform.icon
                return (
                  <Icon 
                    key={platformId} 
                    className={`w-4 h-4 ${platform.color}`} 
                  />
                )
              })}
            </div>

            {/* Post Button */}
            <button 
              disabled={!content.trim() || isOverLimit || selectedPlatforms.length === 0}
              className="flex items-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-gray-600/80 disabled:cursor-not-allowed rounded-lg transition-all duration-200 font-medium text-white neon-glow hover:neon-glow-strong"
            >
              <Send className="w-4 h-4" />
              <span>Yap</span>
            </button>
          </div>
        </div>

        {/* Preview Area */}
        {content && (
          <div className="mt-4 p-4 bg-black/60 rounded-lg border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <div className="text-sm text-purple-300 mb-2 font-medium">Preview</div>
            <div className="text-purple-100 whitespace-pre-wrap leading-relaxed">{content}</div>
          </div>
        )}
      </div>
    </div>
  )
}