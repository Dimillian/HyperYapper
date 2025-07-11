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
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartY, setDragStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)

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

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setDragStartY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const deltaY = e.touches[0].clientY - dragStartY
    if (deltaY > 0) {
      setCurrentY(deltaY)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    if (currentY > 100) {
      onClose()
    }
    setCurrentY(0)
  }

  const getPickerPosition = () => {
    if (typeof window === 'undefined') {
      return { top: '0px', left: '0px' }
    }

    const viewportWidth = window.innerWidth
    const viewportHeight = window.innerHeight
    const isMobile = viewportWidth < 768

    if (isMobile) {
      // On mobile, position as bottom sheet
      return {
        bottom: '0',
        left: '0',
        right: '0',
        transform: 'none'
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
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" 
          onClick={onClose}
        />
      )}
      
      <div 
        ref={pickerRef}
        className={`fixed z-50 ${isMobile ? 'w-full bg-black/95 rounded-t-2xl border-t border-purple-400/40 animate-slideUp' : ''}`}
        style={{
          ...position,
          transform: isMobile && currentY > 0 ? `translateY(${currentY}px)` : position.transform,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
      <div className="relative">
        {/* Mobile drag handle */}
        {isMobile && (
          <div 
            className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-12 h-1.5 bg-purple-400/60 rounded-full" />
          </div>
        )}
        
        {/* Custom styling wrapper for cyberpunk theme */}
        <div className={`emoji-picker-wrapper ${isMobile ? 'border-0 rounded-none bg-transparent' : ''}`}>
          <div className="relative">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={Theme.DARK}
              emojiStyle={EmojiStyle.NATIVE}
              searchPlaceholder="Search emojis..."
              width={isMobile ? typeof window !== 'undefined' ? window.innerWidth : 375 : 320}
              height={isMobile ? 400 : 340}
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