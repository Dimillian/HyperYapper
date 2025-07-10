'use client'

/**
 * Hook for managing reply fetching for notifications
 */

import { useEffect, useRef, useState } from 'react'
import { Notification, ReplyCount } from './types'
import { getReplyFetcherService } from '@/lib/services/replyFetcher'
import { ReplyCache } from '@/lib/storage/replyCache'

interface UseReplyFetchingProps {
  notifications: Notification[]
  onUpdateNotificationReplyCounts: (notificationId: string, replyCounts: ReplyCount[]) => void
  isVisible: boolean
}

interface ReplyFetchingState {
  isFetching: boolean
  error: string | null
}

export function useReplyFetching({ 
  notifications, 
  onUpdateNotificationReplyCounts, 
  isVisible 
}: UseReplyFetchingProps) {
  const [state, setState] = useState<ReplyFetchingState>({
    isFetching: false,
    error: null
  })
  
  const fetchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  /**
   * Get notifications that need reply count updates (limited to first 20)
   */
  const getNotificationsNeedingReplyCounts = (): Notification[] => {
    return notifications
      .sort((a, b) => b.timestamp - a.timestamp) // Sort by newest first (same as UI)
      .slice(0, 20) // Limit to first 20 notifications
      .filter(notification => 
        notification.postIds && 
        notification.postIds.length > 0 &&
        notification.type === 'success' // Only fetch for successful posts
      )
  }
  
  /**
   * Fetch reply counts for all eligible notifications
   */
  const fetchReplyCounts = async () => {
    if (state.isFetching) return // Prevent multiple simultaneous fetches
    
    setState(prev => ({ ...prev, isFetching: true, error: null }))
    
    try {
      // Import reply fetchers to ensure they're registered
      await import('@/lib/services/mastodonReplies')
      await import('@/lib/services/blueskyReplies')
      
      const replyService = getReplyFetcherService()
      const cache = ReplyCache.getInstance()
      const notificationsToUpdate = getNotificationsNeedingReplyCounts()
      
      let hasFreshFetches = false
      
      for (const notification of notificationsToUpdate) {
        if (!notification.postIds) continue
        
        // Check cache first for each post reference
        const cachedCounts = cache.getBatchCachedCounts(
          notification.postIds.map(postId => ({
            platform: postId.platform,
            postId: postId.postId
          }))
        )
        
        // If we have cached data for all platforms, use that immediately
        if (cachedCounts.length === notification.postIds.length) {
          onUpdateNotificationReplyCounts(notification.id, cachedCounts)
        }
        
        // Always try to fetch fresh data (even if cached data exists)
        try {
          const freshCounts = await replyService.fetchAndCacheReplyCounts(notification.postIds)
          hasFreshFetches = true
          
          if (freshCounts.length > 0) {
            onUpdateNotificationReplyCounts(notification.id, freshCounts)
          }
        } catch (error) {
          console.error(`Error fetching replies for notification ${notification.id}:`, error)
          
          // Fall back to cached data if available and we haven't already used it
          if (cachedCounts.length > 0 && cachedCounts.length !== notification.postIds.length) {
            onUpdateNotificationReplyCounts(notification.id, cachedCounts)
          }
        }
      }
      
      // Ensure spinner shows for at least 500ms to provide visual feedback
      if (hasFreshFetches) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      setState(prev => ({ 
        ...prev, 
        isFetching: false
      }))
    } catch (error) {
      console.error('Error in reply fetching:', error)
      setState(prev => ({ 
        ...prev, 
        isFetching: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }))
    }
  }
  
  /**
   * Load cached reply counts on mount
   */
  const loadCachedCounts = () => {
    const cache = ReplyCache.getInstance()
    const notificationsToUpdate = getNotificationsNeedingReplyCounts()
    
    for (const notification of notificationsToUpdate) {
      if (!notification.postIds) continue
      
      const cachedCounts = cache.getBatchCachedCounts(
        notification.postIds.map(postId => ({
          platform: postId.platform,
          postId: postId.postId
        }))
      )
      
      if (cachedCounts.length > 0) {
        onUpdateNotificationReplyCounts(notification.id, cachedCounts)
      }
    }
  }
  
  /**
   * Trigger fetching when sidebar becomes visible
   */
  useEffect(() => {
    if (isVisible) {
      // Load cached counts immediately
      loadCachedCounts()
      
      // Fetch fresh data after a short delay to avoid rapid successive calls
      clearTimeout(fetchTimeoutRef.current)
      fetchTimeoutRef.current = setTimeout(() => {
        fetchReplyCounts()
      }, 1000) // 1 second delay to debounce rapid open/close
    }
    
    return () => {
      clearTimeout(fetchTimeoutRef.current)
    }
  }, [isVisible, notifications.length])
  
  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearTimeout(fetchTimeoutRef.current)
    }
  }, [])
  
  return {
    isFetching: state.isFetching,
    error: state.error,
    manualRefresh: fetchReplyCounts
  }
}