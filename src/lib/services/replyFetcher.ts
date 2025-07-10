/**
 * Unified interface for fetching replies/mentions across all platforms
 */

import { ReplyCount, PostReference } from '@/components/notifications/types'

export interface ReplyFetchResult {
  platform: string
  postId: string
  count: number
  hasUnread: boolean
  replies?: Reply[]
  error?: string
}

export interface Reply {
  id: string
  content: string
  author: {
    username: string
    displayName: string
    avatar?: string
  }
  timestamp: number
  url?: string
}

export interface ReplyFetcher {
  /**
   * Fetch reply count for a specific post
   */
  fetchReplyCount(postRef: PostReference): Promise<ReplyFetchResult>
  
  /**
   * Fetch actual replies for a post (for detailed view)
   */
  fetchReplies(postRef: PostReference, limit?: number): Promise<Reply[]>
  
  /**
   * Check if the service is available (user is authenticated)
   */
  isAvailable(): Promise<boolean>
}

export class ReplyFetcherService {
  private fetchers: Map<string, ReplyFetcher> = new Map()
  
  /**
   * Register a platform-specific reply fetcher
   */
  registerFetcher(platform: string, fetcher: ReplyFetcher) {
    this.fetchers.set(platform, fetcher)
  }
  
  /**
   * Get fetcher for a specific platform
   */
  getFetcher(platform: string): ReplyFetcher | undefined {
    return this.fetchers.get(platform)
  }
  
  /**
   * Fetch reply counts for multiple post references
   */
  async fetchReplyCounts(postRefs: PostReference[]): Promise<ReplyFetchResult[]> {
    const results: ReplyFetchResult[] = []
    
    for (const postRef of postRefs) {
      const fetcher = this.getFetcher(postRef.platform)
      if (!fetcher) {
        results.push({
          platform: postRef.platform,
          postId: postRef.postId,
          count: 0,
          hasUnread: false,
          error: `No fetcher available for ${postRef.platform}`
        })
        continue
      }
      
      try {
        const isAvailable = await fetcher.isAvailable()
        if (!isAvailable) {
          results.push({
            platform: postRef.platform,
            postId: postRef.postId,
            count: 0,
            hasUnread: false,
            error: `${postRef.platform} service not available`
          })
          continue
        }
        
        const result = await fetcher.fetchReplyCount(postRef)
        results.push(result)
      } catch (error) {
        results.push({
          platform: postRef.platform,
          postId: postRef.postId,
          count: 0,
          hasUnread: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }
    
    return results
  }
  
  /**
   * Fetch reply counts and update cache
   */
  async fetchAndCacheReplyCounts(postRefs: PostReference[]): Promise<ReplyCount[]> {
    const { ReplyCache } = await import('@/lib/storage/replyCache')
    const cache = ReplyCache.getInstance()
    
    const results = await this.fetchReplyCounts(postRefs)
    const replyCounts: ReplyCount[] = []
    
    for (const result of results) {
      if (!result.error) {
        const replyCount: ReplyCount = {
          platform: result.platform,
          count: result.count,
          lastFetched: Date.now(),
          hasUnread: result.hasUnread
        }
        
        // Cache the result
        cache.setCachedCount(result.platform, result.postId, replyCount)
        replyCounts.push(replyCount)
      }
    }
    
    return replyCounts
  }
}

// Global singleton instance
let instance: ReplyFetcherService | null = null

export const getReplyFetcherService = (): ReplyFetcherService => {
  if (!instance) {
    instance = new ReplyFetcherService()
  }
  return instance
}