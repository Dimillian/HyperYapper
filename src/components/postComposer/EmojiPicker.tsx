import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import EmojiPicker, { EmojiClickData, EmojiStyle, Theme, Categories, SuggestionMode } from 'emoji-picker-react'
import { EmojiStorageManager } from '@/lib/storage/emojiStorage'

// Custom category data with proper icons
const EMOJI_CATEGORIES = [
  { id: Categories.SMILEYS_PEOPLE, icon: '😀', name: 'Smileys & People' },
  { id: Categories.ANIMALS_NATURE, icon: '🐾', name: 'Animals & Nature' },
  { id: Categories.FOOD_DRINK, icon: '🍎', name: 'Food & Drink' },
  { id: Categories.TRAVEL_PLACES, icon: '🌍', name: 'Travel & Places' },
  { id: Categories.ACTIVITIES, icon: '⚽', name: 'Activities' },
  { id: Categories.OBJECTS, icon: '💡', name: 'Objects' },
  { id: Categories.SYMBOLS, icon: '🔣', name: 'Symbols' },
  { id: Categories.FLAGS, icon: '🏴', name: 'Flags' }
]

interface EmojiPickerProps {
  isVisible: boolean
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
  anchorElement?: HTMLElement | null
}

export function CustomEmojiPicker({ 
  isVisible, 
  onEmojiSelect, 
  onClose, 
  anchorElement 
}: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<any>(null)
  const [activeCategory, setActiveCategory] = useState(Categories.SMILEYS_PEOPLE)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isVisible, onClose])

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji)
    onClose()
  }

  const handleCategoryChange = (categoryId: Categories) => {
    setActiveCategory(categoryId)
    
    // Try to find and click the corresponding category in the hidden nav
    setTimeout(() => {
      if (pickerRef.current) {
        // Look for various possible selectors for category buttons
        const selectors = [
          `[data-category="${categoryId}"]`,
          `.epr-cat-btn[data-category="${categoryId}"]`,
          `.epr-cat-btn:nth-child(${EMOJI_CATEGORIES.findIndex(c => c.id === categoryId) + 1})`
        ]
        
        for (const selector of selectors) {
          const button = pickerRef.current.querySelector(selector) as HTMLElement
          if (button) {
            button.click()
            break
          }
        }
      }
    }, 10)
  }

  const getPickerPosition = () => {
    if (typeof window === 'undefined') {
      return { top: '0px', left: '0px' }
    }

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const isMobile = viewportWidth < 768

    if (isMobile) {
      // On mobile, center the picker
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    }

    if (!anchorElement) {
      console.warn('No anchor element provided for emoji picker')
      return { top: '100px', left: '100px' }
    }

    const rect = anchorElement.getBoundingClientRect()
    console.log('Button rect:', rect)
    
    const pickerWidth = 320
    const pickerHeight = 380
    
    // Calculate horizontal position - center on button
    let leftPos = rect.left + (rect.width / 2) - (pickerWidth / 2)
    
    // Ensure picker doesn't go off screen
    if (leftPos + pickerWidth > viewportWidth - 16) {
      leftPos = viewportWidth - pickerWidth - 16
    }
    if (leftPos < 16) {
      leftPos = 16
    }

    // Calculate vertical position - always show below for now
    const topPos = rect.bottom + 8
    
    console.log('Calculated position:', { top: topPos, left: leftPos })
    
    return {
      top: `${topPos}px`,
      left: `${leftPos}px`
    }
  }

  if (!isVisible) return null

  const position = getPickerPosition()
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  const pickerContent = (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" />
      )}
      
      <div 
        ref={pickerRef}
        className={`fixed z-50 ${isMobile ? 'w-11/12 max-w-sm' : ''}`}
        style={position}
      >
      <div className="relative">
        {/* Custom styling wrapper for cyberpunk theme */}
        <div className="emoji-picker-wrapper">
          <div className="relative">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={Theme.DARK}
              emojiStyle={EmojiStyle.NATIVE}
              searchPlaceholder="Search emojis..."
              width={isMobile ? 300 : 320}
              height={isMobile ? 310 : 340}
              previewConfig={{
                showPreview: false
              }}
              skinTonesDisabled={false}
              searchDisabled={false}
              autoFocusSearch={false}
              lazyLoadEmojis={true}
            />
            
            {/* Custom Category Navigation - positioned after search, before content */}
            <div className="custom-emoji-categories absolute top-[80px] left-0 right-0 z-10">
              <div className="category-scroll">
                {EMOJI_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex-shrink-0 p-1.5 rounded-md transition-all duration-200 text-sm min-w-[32px] ${
                      activeCategory === category.id
                        ? 'bg-purple-500/30 border border-purple-400/70 shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                        : 'bg-transparent border border-purple-400/30 hover:bg-purple-500/20 hover:border-purple-400/50'
                    }`}
                    title={category.name}
                  >
                    {category.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
    </>
  )

  // Render using portal to ensure proper positioning
  if (typeof window === 'undefined') return null
  
  return createPortal(pickerContent, document.body)
}