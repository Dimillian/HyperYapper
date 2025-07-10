'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { SessionManager } from '@/lib/storage/sessionStorage'
import { PlatformButton } from '@/components/PlatformButton'
import { PostService } from '@/lib/posting/postService'
import { PLATFORMS } from '@/types/platform'
import { PLATFORM_LIMITS } from './types'
import { useImageHandler } from './useImageHandler'
import { DragDropOverlay } from './DragDropOverlay'
import { TextArea } from './TextArea'
import { ImagePreview } from './ImagePreview'
import { Toolbar } from './Toolbar'
import { useNotifications } from '../notifications'
import { MastodonSession, BlueSkySession } from '@/types/auth'

export function PostEditor() {
  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [isExpanded, setIsExpanded] = useState(false)
  const [connectedPlatforms, setConnectedPlatforms] = useState<string[]>([])
  const [isPosting, setIsPosting] = useState(false)
  const [mastodonSession, setMastodonSession] = useState<MastodonSession | null>(null)
  const [blueSkySession, setBlueSkySession] = useState<BlueSkySession | null>(null)
  
  const { addNotification } = useNotifications()
  
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
    
    // Get platform sessions if available
    const mastodonSession = sessionManager.getMastodonSession()
    setMastodonSession(mastodonSession)
    
    const blueSkySession = sessionManager.getBlueSkySession()
    setBlueSkySession(blueSkySession)
    
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

    try {
      const result = await PostService.postToAll({
        text: content.trim(),
        platforms: selectedPlatforms,
        images: attachedImages.map(img => img.file)
      })

      // Create notification for the post results
      const allSuccessful = result.results.every(r => r.success)
      const someSuccessful = result.results.some(r => r.success)
      
      let notificationTitle = ''
      let notificationMessage = ''
      let notificationType: 'success' | 'error' | 'info' = 'info'

      if (allSuccessful) {
        notificationTitle = 'Posted successfully!'
        notificationMessage = `Your post was published to ${selectedPlatforms.join(', ')}`
        notificationType = 'success'
      } else if (someSuccessful) {
        const successCount = result.results.filter(r => r.success).length
        const totalCount = result.results.length
        notificationTitle = 'Partially posted'
        notificationMessage = `Posted to ${successCount} of ${totalCount} platforms`
        notificationType = 'error'
      } else {
        notificationTitle = 'Post failed'
        notificationMessage = 'Could not post to any platform'
        notificationType = 'error'
      }

      addNotification({
        type: notificationType,
        title: notificationTitle,
        message: notificationMessage,
        postResults: result.results.map(r => ({
          platform: r.platform,
          success: r.success,
          postId: r.postId,
          postUrl: r.postUrl,
          error: r.error
        }))
      })

      // If all posts were successful, clear the editor
      if (allSuccessful) {
        setContent('')
        clearImages()
        setIsExpanded(false)
      }
    } catch (error) {
      console.error('Posting error:', error)
      addNotification({
        type: 'error',
        title: 'Post failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
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
          mastodonSession={mastodonSession}
          blueSkySession={blueSkySession}
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

      </div>
    </div>
  )
}