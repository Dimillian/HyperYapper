import { RefObject, useState, useRef } from 'react'
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
import { CustomEmojiPicker } from './EmojiPicker'

interface ToolbarProps {
  fileInputRef: RefObject<HTMLInputElement | null>
  selectedPlatforms: string[]
  content: string
  isOverLimit: boolean
  isPosting: boolean
  onPost: () => void
  onInsertText?: (text: string) => void
}

export function Toolbar({
  fileInputRef,
  selectedPlatforms,
  content,
  isOverLimit,
  isPosting,
  onPost,
  onInsertText
}: ToolbarProps) {
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)

  const handleEmojiSelect = (emoji: string) => {
    onInsertText?.(emoji)
    setIsEmojiPickerVisible(false)
  }

  const toggleEmojiPicker = () => {
    setIsEmojiPickerVisible(!isEmojiPickerVisible)
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg bg-black/50 border border-purple-400/30 hover:border-purple-300/50 hover:bg-purple-500/10 transition-all duration-200"
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image className="w-5 h-5 text-purple-300 hover:text-purple-200" />
        </button>
        <button 
          ref={emojiButtonRef}
          onClick={toggleEmojiPicker}
          className={`p-2 rounded-lg bg-black/50 border transition-all duration-200 ${
            isEmojiPickerVisible 
              ? 'border-purple-300/50 bg-purple-500/10' 
              : 'border-purple-400/30 hover:border-purple-300/50 hover:bg-purple-500/10'
          }`}
          title="Add emoji"
        >
          <Smile className={`w-5 h-5 transition-colors duration-200 ${
            isEmojiPickerVisible ? 'text-purple-200' : 'text-purple-300 hover:text-purple-200'
          }`} />
        </button>
        <button 
          onClick={() => onInsertText?.('#')}
          className="p-2 rounded-lg bg-black/50 border border-purple-400/30 hover:border-purple-300/50 hover:bg-purple-500/10 transition-all duration-200"
          title="Add hashtag"
        >
          <Hash className="w-5 h-5 text-purple-300 hover:text-purple-200" />
        </button>
        <button 
          onClick={() => onInsertText?.('@')}
          className="p-2 rounded-lg bg-black/50 border border-purple-400/30 hover:border-purple-300/50 hover:bg-purple-500/10 transition-all duration-200"
          title="Add mention"
        >
          <AtSign className="w-5 h-5 text-purple-300 hover:text-purple-200" />
        </button>
        <button 
          disabled
          className="p-2 rounded-lg bg-black/50 border border-gray-600/30 cursor-not-allowed opacity-50 transition-all duration-200"
          title="AI enhancement (coming soon)"
        >
          <Wand2 className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
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
          className="flex items-center justify-center gap-2 px-6 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-gray-600/80 disabled:cursor-not-allowed rounded-lg transition-all duration-200 font-medium text-white neon-glow hover:neon-glow-strong w-full sm:w-auto"
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
      
      {/* Emoji Picker */}
      <CustomEmojiPicker
        isVisible={isEmojiPickerVisible}
        onEmojiSelect={handleEmojiSelect}
        onClose={() => setIsEmojiPickerVisible(false)}
        anchorElement={emojiButtonRef.current}
      />
    </div>
  )
}