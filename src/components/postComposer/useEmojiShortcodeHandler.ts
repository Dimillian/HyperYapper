import { useState, useCallback, RefObject } from 'react'
import { findMatchingShortcodes, shortcodeToEmoji } from '@/lib/emoji/emojiShortcodes'

interface EmojiShortcodeState {
  isVisible: boolean
  query: string
  position: { top: number; left: number }
  startIndex: number
}

const initialState: EmojiShortcodeState = {
  isVisible: false,
  query: '',
  position: { top: 0, left: 0 },
  startIndex: 0
}

export function useEmojiShortcodeHandler(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  content: string,
  setContent: (content: string) => void
) {
  const [shortcodeState, setShortcodeState] = useState<EmojiShortcodeState>(initialState)

  const calculateCaretPosition = useCallback(() => {
    if (!textareaRef.current) return { top: 0, left: 0 }
    
    const textarea = textareaRef.current
    const cursorPosition = textarea.selectionStart
    const textareaRect = textarea.getBoundingClientRect()
    
    // Create a mirror div to calculate text position
    const mirror = document.createElement('div')
    const computedStyle = window.getComputedStyle(textarea)
    
    // Copy all relevant styles from textarea
    const stylesToCopy = [
      'fontSize', 'fontFamily', 'fontWeight', 'fontStyle', 'letterSpacing',
      'lineHeight', 'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'border', 'borderWidth', 'borderStyle', 'whiteSpace', 'wordWrap', 'wordBreak',
      'textTransform', 'textIndent', 'textAlign', 'direction', 'boxSizing'
    ]
    
    stylesToCopy.forEach(prop => {
      mirror.style[prop as any] = computedStyle[prop as any]
    })
    
    // Position mirror off-screen but visible for measurement
    mirror.style.position = 'absolute'
    mirror.style.visibility = 'hidden'
    mirror.style.top = '0'
    mirror.style.left = '0'
    mirror.style.width = computedStyle.width
    mirror.style.height = 'auto'
    mirror.style.minHeight = computedStyle.height
    mirror.style.maxHeight = 'none'
    mirror.style.overflow = 'hidden'
    mirror.style.whiteSpace = 'pre-wrap'
    mirror.style.wordWrap = 'break-word'
    
    // Add text up to cursor position
    const textBeforeCursor = content.substring(0, cursorPosition)
    mirror.textContent = textBeforeCursor
    
    // Add a span to mark cursor position
    const cursorSpan = document.createElement('span')
    cursorSpan.textContent = '|'
    mirror.appendChild(cursorSpan)
    
    document.body.appendChild(mirror)
    
    // Get the position of the cursor span
    const cursorSpanRect = cursorSpan.getBoundingClientRect()
    
    // Calculate position relative to textarea
    const relativeTop = cursorSpanRect.top - textareaRect.top
    const relativeLeft = cursorSpanRect.left - textareaRect.left
    
    // Get line height from computed style
    const lineHeight = parseInt(computedStyle.lineHeight) || 24
    
    document.body.removeChild(mirror)
    
    // Return position relative to the page (absolute positioning)
    return {
      top: textareaRect.top + relativeTop + lineHeight + 8, // Line height + 8px padding below cursor
      left: textareaRect.left + relativeLeft
    }
  }, [textareaRef, content])

  const handleInput = useCallback((newContent: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const cursorPos = textarea.selectionStart
    const textBeforeCursor = newContent.substring(0, cursorPos)
    
    // Look for emoji shortcode pattern (:word)
    const shortcodeMatch = textBeforeCursor.match(/:([a-zA-Z0-9_]*)$/)
    
    if (shortcodeMatch) {
      const query = `:${shortcodeMatch[1]}`
      const startIndex = cursorPos - query.length
      
      // Only show dropdown if we have at least `:` and some matches
      const matches = findMatchingShortcodes(query)
      
      if (query.length >= 1 && matches.length > 0) {
        const position = calculateCaretPosition()
        
        setShortcodeState({
          isVisible: true,
          query,
          position,
          startIndex
        })
      } else {
        setShortcodeState(initialState)
      }
    } else {
      setShortcodeState(initialState)
    }
  }, [textareaRef, calculateCaretPosition])

  const handleShortcodeSelect = useCallback((shortcode: string, emoji: string) => {
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const beforeShortcode = content.substring(0, shortcodeState.startIndex)
    const afterCursor = content.substring(textarea.selectionStart)
    
    const newContent = beforeShortcode + emoji + afterCursor
    setContent(newContent)
    
    // Position cursor after the inserted emoji
    const newCursorPos = shortcodeState.startIndex + emoji.length
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        textareaRef.current.focus()
      }
    }, 0)
    
    setShortcodeState(initialState)
  }, [content, shortcodeState.startIndex, setContent, textareaRef])

  const closeShortcodeDropdown = useCallback(() => {
    setShortcodeState(initialState)
  }, [])

  return {
    shortcodeState,
    handleInput,
    handleShortcodeSelect,
    closeShortcodeDropdown
  }
}