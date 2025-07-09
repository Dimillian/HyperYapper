import { useState, useRef, useCallback, RefObject } from 'react'

interface MentionState {
  isVisible: boolean
  query: string
  position: { top: number; left: number }
  startIndex: number
}

interface MastodonAccount {
  id: string
  username: string
  acct: string
  display_name: string
  avatar: string
  avatar_static: string
}

export function useMentionHandler(
  textareaRef: RefObject<HTMLTextAreaElement>,
  content: string,
  setContent: (content: string) => void,
  selectedPlatforms: string[]
) {
  const [mentionState, setMentionState] = useState<MentionState>({
    isVisible: false,
    query: '',
    position: { top: 0, left: 0 },
    startIndex: 0
  })

  const isMastodonOnly = selectedPlatforms.length === 1 && selectedPlatforms[0] === 'mastodon'

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
    
    document.body.removeChild(mirror)
    
    // Return position relative to the page (absolute positioning)
    return {
      top: textareaRect.top + relativeTop + 25, // 25px below cursor
      left: textareaRect.left + relativeLeft
    }
  }, [textareaRef, content])

  const handleInput = useCallback((newContent: string) => {
    if (!isMastodonOnly) {
      setMentionState(prev => ({ ...prev, isVisible: false }))
      return
    }

    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPosition = textarea.selectionStart
    const textBeforeCursor = newContent.substring(0, cursorPosition)
    
    // Find the last @ symbol
    const lastAtIndex = textBeforeCursor.lastIndexOf('@')
    
    if (lastAtIndex === -1) {
      setMentionState(prev => ({ ...prev, isVisible: false }))
      return
    }
    
    // Check if there's a space between @ and cursor (should close dropdown)
    const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1)
    if (textAfterAt.includes(' ') || textAfterAt.includes('\n')) {
      setMentionState(prev => ({ ...prev, isVisible: false }))
      return
    }
    
    // Check if @ is at start of line or after whitespace
    const charBeforeAt = lastAtIndex > 0 ? textBeforeCursor[lastAtIndex - 1] : ' '
    if (charBeforeAt !== ' ' && charBeforeAt !== '\n' && lastAtIndex !== 0) {
      setMentionState(prev => ({ ...prev, isVisible: false }))
      return
    }
    
    // Show mention dropdown
    const query = textAfterAt
    const position = calculateCaretPosition()
    
    setMentionState({
      isVisible: true,
      query,
      position,
      startIndex: lastAtIndex
    })
  }, [isMastodonOnly, textareaRef, calculateCaretPosition])

  const handleMentionSelect = useCallback((account: MastodonAccount) => {
    const beforeMention = content.substring(0, mentionState.startIndex)
    const afterCursor = content.substring(textareaRef.current?.selectionStart || 0)
    const mentionText = `@${account.acct}`
    
    const newContent = beforeMention + mentionText + ' ' + afterCursor
    setContent(newContent)
    
    // Set cursor position after mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = beforeMention.length + mentionText.length + 1
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
        textareaRef.current.focus()
      }
    }, 0)
    
    setMentionState(prev => ({ ...prev, isVisible: false }))
  }, [content, mentionState.startIndex, textareaRef, setContent])

  const closeMentionDropdown = useCallback(() => {
    setMentionState(prev => ({ ...prev, isVisible: false }))
  }, [])

  return {
    mentionState,
    handleInput,
    handleMentionSelect,
    closeMentionDropdown,
    isMastodonOnly
  }
}