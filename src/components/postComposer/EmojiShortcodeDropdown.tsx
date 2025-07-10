import { useState, useEffect } from 'react'
import { findMatchingShortcodes, shortcodeToEmoji } from '@/lib/emoji/emojiShortcodes'

interface EmojiShortcodeDropdownProps {
  isVisible: boolean
  query: string
  position: { top: number; left: number }
  onSelect: (shortcode: string, emoji: string) => void
  onClose: () => void
}

export function EmojiShortcodeDropdown({ 
  isVisible, 
  query, 
  position, 
  onSelect, 
  onClose 
}: EmojiShortcodeDropdownProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (!isVisible || query.length < 2) {
      setSuggestions([])
      return
    }

    const matches = findMatchingShortcodes(query)
    setSuggestions(matches)
    setSelectedIndex(0)
  }, [isVisible, query])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || suggestions.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          if (suggestions[selectedIndex]) {
            const shortcode = suggestions[selectedIndex]
            const emoji = shortcodeToEmoji(shortcode)
            if (emoji) {
              onSelect(shortcode, emoji)
            }
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, suggestions, selectedIndex, onSelect, onClose])

  if (!isVisible || suggestions.length === 0) {
    return null
  }

  return (
    <div 
      className="absolute bg-black/90 backdrop-blur-sm border border-purple-400/40 rounded-lg shadow-xl z-50 w-64 max-h-48 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      <div className="py-2">
        {suggestions.map((shortcode, index) => {
          const emoji = shortcodeToEmoji(shortcode)
          if (!emoji) return null
          
          return (
            <button
              key={shortcode}
              onClick={() => onSelect(shortcode, emoji)}
              className={`w-full px-3 py-2 text-left hover:bg-purple-500/20 transition-colors duration-150 flex items-center gap-3 ${
                index === selectedIndex ? 'bg-purple-500/20' : ''
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="text-purple-100 font-medium truncate">
                  {shortcode}
                </div>
                <div className="text-purple-300/60 text-xs truncate">
                  {shortcode.replace(/:/g, '').replace(/_/g, ' ')}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}