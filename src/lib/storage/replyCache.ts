/**
 * Local storage caching system for reply counts
 */

import { ReplyCount } from '@/components/notifications/types'

interface CachedReplyData {
  [postKey: string]: ReplyCount
}

interface ReplyCacheData {
  [platform: string]: CachedReplyData
}

export class ReplyCache {
  private static instance: ReplyCache | null = null
  private storageKey = 'hyperyapper_reply_cache'
  
  private constructor() {}
  
  static getInstance(): ReplyCache {
    if (!ReplyCache.instance) {
      ReplyCache.instance = new ReplyCache()
    }
    return ReplyCache.instance
  }
  
  /**
   * Generate cache key for a specific post
   */
  private getPostKey(platform: string, postId: string): string {
    return `${platform}:${postId}`
  }
  
  /**
   * Load cache data from localStorage
   */
  private loadCache(): ReplyCacheData {
    if (typeof window === 'undefined') return {}
    
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : {}
    } catch (error) {
      console.warn('Failed to load reply cache:', error)
      return {}
    }
  }
  
  /**
   * Save cache data to localStorage
   */
  private saveCache(data: ReplyCacheData): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.warn('Failed to save reply cache:', error)
    }
  }
  
  
  /**
   * Get cached reply count for a specific post
   */
  getCachedCount(platform: string, postId: string): ReplyCount | null {
    const cache = this.loadCache()
    const platformData = cache[platform]
    
    if (!platformData) return null
    
    const postKey = this.getPostKey(platform, postId)
    const cachedData = platformData[postKey]
    
    if (!cachedData) return null
    
    return cachedData
  }
  
  /**
   * Set cached reply count for a specific post
   */
  setCachedCount(platform: string, postId: string, replyCount: ReplyCount): void {
    const cache = this.loadCache()
    
    if (!cache[platform]) {
      cache[platform] = {}
    }
    
    const postKey = this.getPostKey(platform, postId)
    cache[platform][postKey] = replyCount
    
    this.saveCache(cache)
  }
  
  /**
   * Get all cached counts for multiple posts
   */
  getBatchCachedCounts(requests: Array<{ platform: string; postId: string }>): ReplyCount[] {
    const results: ReplyCount[] = []
    
    for (const request of requests) {
      const cached = this.getCachedCount(request.platform, request.postId)
      if (cached) {
        results.push(cached)
      }
    }
    
    return results
  }
  
  /**
   * Check if a post has cached data
   */
  isCached(platform: string, postId: string): boolean {
    const cached = this.getCachedCount(platform, postId)
    return cached !== null
  }
  
  /**
   * Clear all cached reply counts
   */
  clearCache(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.warn('Failed to clear reply cache:', error)
    }
  }
  
  /**
   * Clear cached data for a specific platform
   */
  clearPlatformCache(platform: string): void {
    const cache = this.loadCache()
    delete cache[platform]
    this.saveCache(cache)
  }

  /**
   * Clear cached reply counts for specific posts (when notification is deleted)
   */
  clearPostCaches(postReferences: Array<{ platform: string; postId: string }>): void {
    const cache = this.loadCache()
    let hasChanges = false

    for (const { platform, postId } of postReferences) {
      const platformData = cache[platform]
      if (platformData) {
        const postKey = this.getPostKey(platform, postId)
        if (platformData[postKey]) {
          delete platformData[postKey]
          hasChanges = true
        }
      }
    }

    if (hasChanges) {
      this.saveCache(cache)
    }
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats(): { totalEntries: number; platforms: string[]; oldestEntry: number | null } {
    const cache = this.loadCache()
    let totalEntries = 0
    let oldestEntry: number | null = null
    const platforms = Object.keys(cache)
    
    for (const platformData of Object.values(cache)) {
      totalEntries += Object.keys(platformData).length
      
      for (const cachedData of Object.values(platformData)) {
        if (oldestEntry === null || cachedData.lastFetched < oldestEntry) {
          oldestEntry = cachedData.lastFetched
        }
      }
    }
    
    return { totalEntries, platforms, oldestEntry }
  }
}