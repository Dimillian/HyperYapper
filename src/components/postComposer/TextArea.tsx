import React, { RefObject } from 'react'
import { PLATFORM_LIMITS } from './types'
import { SyntaxHighlighter } from './SyntaxHighlighter'
import { MentionDropdown } from './MentionDropdown'
import { useMentionHandler } from './useMentionHandler'
import { MastodonSession, BlueSkySession } from '@/types/auth'

interface TextAreaProps {
  textareaRef: RefObject<HTMLTextAreaElement | null>
  content: string
  setContent: (content: string) => void
  isExpanded: boolean
  setIsExpanded: (expanded: boolean) => void
  selectedPlatforms: string[]
  onPaste: (e: React.ClipboardEvent) => void
  mastodonSession: MastodonSession | null
  blueSkySession: BlueSkySession | null
  mentionButtonRef?: React.MutableRefObject<{ handleMentionButtonClick: () => void } | null>
}

export function TextArea({
  textareaRef,
  content,
  setContent,
  isExpanded,
  setIsExpanded,
  selectedPlatforms,
  onPaste,
  mastodonSession,
  blueSkySession,
  mentionButtonRef
}: TextAreaProps) {
  const getCharacterLimit = () => {
    if (selectedPlatforms.length === 0) return 280
    return Math.min(...selectedPlatforms.map(id => PLATFORM_LIMITS[id as keyof typeof PLATFORM_LIMITS]))
  }

  const currentLimit = getCharacterLimit()
  const remaining = currentLimit - content.length
  const isOverLimit = remaining < 0

  const {
    mentionState,
    handleInput,
    handleMentionSelect,
    closeMentionDropdown,
    handleMentionButtonClick,
    isSinglePlatform,
    hasConnectedPlatforms,
    mentionPlatform
  } = useMentionHandler(textareaRef, content, setContent, selectedPlatforms)

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
    handleInput(newContent)
  }

  // Expose handleMentionButtonClick via ref
  React.useEffect(() => {
    if (mentionButtonRef) {
      mentionButtonRef.current = { handleMentionButtonClick }
    }
  }, [mentionButtonRef, handleMentionButtonClick])

  return (
    <div className="relative">
      {/* Textarea with background */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => handleContentChange(e.target.value)}
        onFocus={() => setIsExpanded(true)}
        onPaste={onPaste}
        placeholder={`What's happening? Time to yap...${isSinglePlatform ? ' (@mentions available)' : ''}`}
        className={`w-full bg-black/70 border border-purple-400/40 rounded-lg p-4 placeholder-purple-300/50 resize-none transition-all duration-200 focus:border-purple-300/70 focus:bg-black/80 focus:shadow-[0_0_20px_rgba(168,85,247,0.3)] ${
          isExpanded ? 'h-32' : 'h-20'
        } ${isOverLimit ? 'border-red-400/70 focus:border-red-400/70' : ''}`}
        style={{ color: 'transparent', caretColor: '#c4b5fd' }}
      />
      
      {/* Syntax Highlighting Overlay - positioned on top */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <SyntaxHighlighter
          content={content}
          className={`w-full bg-transparent border border-transparent rounded-lg p-4 text-purple-100 resize-none ${
            isExpanded ? 'h-32' : 'h-20'
          } overflow-hidden`}
        />
      </div>
      
      {/* Character Counter */}
      <div className="absolute bottom-2 right-2 text-sm font-medium z-20">
        <span className={`${
          isOverLimit ? 'text-red-300 drop-shadow-[0_0_4px_rgba(239,68,68,0.6)]' : 
          remaining < 20 ? 'text-yellow-300 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]' : 
          'text-purple-300 drop-shadow-[0_0_4px_rgba(168,85,247,0.6)]'
        }`}>
          {remaining}
        </span>
      </div>

      {/* Mention Dropdown */}
      {hasConnectedPlatforms && (
        <MentionDropdown
          isVisible={mentionState.isVisible}
          query={mentionState.query}
          position={mentionState.position}
          mastodonSession={mastodonSession}
          blueSkySession={blueSkySession}
          platform={mentionPlatform}
          allowMultiPlatform={!isSinglePlatform}
          onSelect={handleMentionSelect}
          onClose={closeMentionDropdown}
        />
      )}
    </div>
  )
}