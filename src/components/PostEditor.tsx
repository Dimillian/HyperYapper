'use client'

import { useState } from 'react'
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
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['twitter'])
  const [isExpanded, setIsExpanded] = useState(false)

  const handlePlatformToggle = (platformId: string) => {
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
            
            return (
              <button
                key={platform.id}
                onClick={() => handlePlatformToggle(platform.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  isSelected 
                    ? 'bg-purple-500/20 border-purple-400/50 text-purple-300' 
                    : 'bg-black/40 border-gray-700 text-gray-400 hover:border-purple-500/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? platform.color : 'text-gray-400'}`} />
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
            className={`w-full bg-black/60 border border-purple-500/20 rounded-lg p-4 text-white placeholder-gray-500 resize-none transition-all duration-200 focus:border-purple-400/50 focus:bg-black/80 ${
              isExpanded ? 'h-32' : 'h-20'
            } ${isOverLimit ? 'border-red-500/50' : ''}`}
          />
          
          {/* Character Counter */}
          <div className="absolute bottom-2 right-2 text-sm">
            <span className={`${
              isOverLimit ? 'text-red-400' : 
              remaining < 20 ? 'text-yellow-400' : 
              'text-purple-400'
            }`}>
              {remaining}
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-black/40 border border-gray-700 hover:border-purple-500/30 transition-colors">
              <Image className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 rounded-lg bg-black/40 border border-gray-700 hover:border-purple-500/30 transition-colors">
              <Smile className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 rounded-lg bg-black/40 border border-gray-700 hover:border-purple-500/30 transition-colors">
              <Hash className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 rounded-lg bg-black/40 border border-gray-700 hover:border-purple-500/30 transition-colors">
              <AtSign className="w-5 h-5 text-gray-400" />
            </button>
            <button className="p-2 rounded-lg bg-black/40 border border-gray-700 hover:border-purple-500/30 transition-colors">
              <Wand2 className="w-5 h-5 text-gray-400" />
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
              className="flex items-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
              <span className="font-medium">Yap</span>
            </button>
          </div>
        </div>

        {/* Preview Area */}
        {content && (
          <div className="mt-4 p-4 bg-black/40 rounded-lg border border-purple-500/10">
            <div className="text-sm text-purple-400/70 mb-2">Preview</div>
            <div className="text-white/90 whitespace-pre-wrap">{content}</div>
          </div>
        )}
      </div>
    </div>
  )
}