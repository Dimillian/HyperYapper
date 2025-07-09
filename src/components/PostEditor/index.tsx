'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { SessionManager } from '@/lib/storage/sessionStorage'
import { PlatformButton } from '@/components/PlatformButton'
import { PostService } from '@/lib/posting/postService'
import { PLATFORMS } from '@/types/platform'
import { PostStatus } from '@/types/post'
import { PLATFORM_LIMITS } from './types'
import { useImageHandler } from './useImageHandler'
import { DragDropOverlay } from './DragDropOverlay'
import { TextArea } from './TextArea'
import { ImagePreview } from './ImagePreview'
import { Toolbar } from './Toolbar'
import { PostResults } from './PostResults'

export function PostEditor() {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [postStatus, setPostStatus] = useState<PostStatus | null>(null)
  const [isPosting, setIsPosting] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    attachedImages,
    isDragging,
    handleImageSelect,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeImage,
    clearImages
  } = useImageHandler()

  const refreshConnectedPlatforms = useCallback(() => {
    const sessionManager = SessionManager.getInstance()
    const connected = sessionManager.getConnectedPlatforms()
    setConnectedPlatforms(connected)
    
    // Update selected platforms to only include connected ones
    setSelectedPlatforms(prev => {
      const filteredPlatforms = prev.filter(platform => connected.includes(platform))
      // Auto-select connected platforms if none are selected and there are connected platforms
      if (filteredPlatforms.length === 0 && connected.length > 0) {
        return connected
      }
      return filteredPlatforms
    })
  }, [])

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

  const handlePost = async () => {
    if (!content.trim() || isOverLimit || selectedPlatforms.length === 0 || isPosting) {
      return
    }

    setIsPosting(true)
    setPostStatus(null)

    try {
      const result = await PostService.postToAll({
        text: content.trim(),
        platforms: selectedPlatforms
      })

      setPostStatus(result)

      // If all posts were successful, clear the editor
      const allSuccessful = result.results.every(r => r.success)
      if (allSuccessful) {
        setContent('')
        clearImages()
        setIsExpanded(false)
      }
    } catch (error) {
      console.error('Posting error:', error)
      setPostStatus({
        isPosting: false,
        results: [],
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      })
    } finally {
      setIsPosting(false)
    }
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
      <div 
        className={`glass-card p-6 space-y-4 transition-all duration-200 relative ${
          isDragging ? 'border-purple-400 bg-purple-500/10' : ''
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <DragDropOverlay isDragging={isDragging} />

        {/* Platform Selection */}
        <div className="flex flex-wrap gap-2">
          {PLATFORMS.map(platform => (
            <PlatformButton
              key={platform.id}
              platform={platform}
              isSelected={selectedPlatforms.includes(platform.id)}
              isConnected={connectedPlatforms.includes(platform.id)}
              onClick={handlePlatformToggle}
            />
          ))}
        </div>

        {/* Text Editor */}
        <TextArea
          textareaRef={textareaRef}
          content={content}
          setContent={setContent}
          isExpanded={isExpanded}
          setIsExpanded={setIsExpanded}
          selectedPlatforms={selectedPlatforms}
          onPaste={handlePaste}
        />

        {/* Image Previews */}
        <ImagePreview images={attachedImages} onRemove={removeImage} />

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Toolbar */}
        <Toolbar
          fileInputRef={fileInputRef}
          selectedPlatforms={selectedPlatforms}
          content={content}
          isOverLimit={isOverLimit}
          isPosting={isPosting}
          onPost={handlePost}
        />

        {/* Preview Area */}
        {content && (
          <div className="mt-4 p-4 bg-black/60 rounded-lg border border-purple-400/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
            <div className="text-sm text-purple-300 mb-2 font-medium">Preview</div>
            <div className="text-purple-100 whitespace-pre-wrap leading-relaxed">{content}</div>
          </div>
        )}

        {/* Post Results */}
        <PostResults postStatus={postStatus} />
      </div>
    </div>
  )
}