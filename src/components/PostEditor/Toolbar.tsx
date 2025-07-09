import { RefObject } from 'react'
import { 
  Send, 
  Image, 
  Smile, 
  Hash, 
  AtSign, 
  Wand2,
  Loader2
} from 'lucide-react'
import { PLATFORMS } from '@/types/platform'
import { getPlatformIcon } from './utils'

interface ToolbarProps {
  fileInputRef: RefObject<HTMLInputElement>
  selectedPlatforms: string[]
  content: string
  isOverLimit: boolean
  isPosting: boolean
  onPost: () => void
}

export function Toolbar({
  fileInputRef,
  selectedPlatforms,
  content,
  isOverLimit,
  isPosting,
  onPost
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg bg-black/50 border border-purple-400/30 hover:border-purple-300/50 hover:bg-purple-500/10 transition-all duration-200"
        >
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
            const Icon = getPlatformIcon(platformId)
            return (
              <div
                key={platformId}
                style={{ 
                  color: platform.brandColor,
                  filter: `drop-shadow(0 0 4px ${platform.glowColor})`
                }}
              >
                {Icon}
              </div>
            )
          })}
        </div>

        {/* Post Button */}
        <button 
          onClick={onPost}
          disabled={!content.trim() || isOverLimit || selectedPlatforms.length === 0 || isPosting}
          className="flex items-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-gray-600/80 disabled:cursor-not-allowed rounded-lg transition-all duration-200 font-medium text-white neon-glow hover:neon-glow-strong"
        >
          {isPosting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Posting...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Yap</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}