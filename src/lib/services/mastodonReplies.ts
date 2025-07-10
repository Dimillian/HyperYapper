/**
 * Mastodon-specific reply fetching implementation
 */

import { ReplyFetcher, Reply, ReplyFetchResult } from './replyFetcher'
import { PostReference } from '@/components/notifications/types'
import { MastodonSession } from '@/types/auth'
import { SessionManager } from '@/lib/storage/sessionStorage'

interface MastodonStatus {
  id: string
  content: string
  created_at: string
  url: string
  account: {
    id: string
    username: string
    acct: string
    display_name: string
    avatar: string
    avatar_static: string
  }
  replies_count: number
  reblogs_count: number
  favourites_count: number
}

interface MastodonContext {
  ancestors: MastodonStatus[]
  descendants: MastodonStatus[]
}

export class MastodonReplyFetcher implements ReplyFetcher {
  private sessionManager = SessionManager.getInstance()
  
  /**
   * Check if Mastodon service is available (user is authenticated)
   */
  async isAvailable(): Promise<boolean> {
    const session = this.sessionManager.getMastodonSession()
    return session !== null
  }
  
  /**
   * Get the Mastodon session
   */
  private getMastodonSession(): MastodonSession | null {
    return this.sessionManager.getMastodonSession()
  }
  
  /**
   * Make authenticated request to Mastodon API
   */
  private async makeRequest(instanceUrl: string, endpoint: string, accessToken: string): Promise<any> {
    const url = `${instanceUrl}/api/v1${endpoint}`
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Mastodon API error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }
  
  /**
   * Convert Mastodon status to our Reply interface
   */
  private convertStatusToReply(status: MastodonStatus): Reply {
    return {
      id: status.id,
      content: this.stripHtmlTags(status.content),
      author: {
        username: status.account.acct,
        displayName: status.account.display_name || status.account.username,
        avatar: status.account.avatar_static || status.account.avatar
      },
      timestamp: new Date(status.created_at).getTime(),
      url: status.url
    }
  }
  
  /**
   * Strip HTML tags from content for plain text preview
   */
  private stripHtmlTags(html: string): string {
    // Create a temporary div to parse HTML
    if (typeof window !== 'undefined') {
      const temp = document.createElement('div')
      temp.innerHTML = html
      return temp.textContent || temp.innerText || ''
    }
    
    // Fallback for server-side: basic HTML tag removal
    return html.replace(/<[^>]*>/g, '').trim()
  }
  
  /**
   * Fetch reply count for a specific Mastodon post
   */
  async fetchReplyCount(postRef: PostReference): Promise<ReplyFetchResult> {
    const session = this.getMastodonSession()
    if (!session) {
      throw new Error('No Mastodon session found')
    }
    
    try {
      // Fetch the context (replies) for the post
      const context: MastodonContext = await this.makeRequest(
        session.instance,
        `/statuses/${postRef.postId}/context`,
        session.accessToken
      )
      
      const replyCount = context.descendants.length
      
      // For now, we'll consider all replies as "unread" since we don't have 
      // a mechanism to track read state yet
      const hasUnread = replyCount > 0
      
      return {
        platform: 'mastodon',
        postId: postRef.postId,
        count: replyCount,
        hasUnread,
        replies: context.descendants.slice(0, 5).map(status => this.convertStatusToReply(status)) // Include first 5 replies for preview
      }
    } catch (error) {
      console.error('Error fetching Mastodon reply count:', error)
      
      return {
        platform: 'mastodon',
        postId: postRef.postId,
        count: 0,
        hasUnread: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Fetch actual replies for a Mastodon post
   */
  async fetchReplies(postRef: PostReference, limit: number = 50): Promise<Reply[]> {
    const session = this.getMastodonSession()
    if (!session) {
      throw new Error('No Mastodon session found')
    }
    
    try {
      const context: MastodonContext = await this.makeRequest(
        session.instance,
        `/statuses/${postRef.postId}/context`,
        session.accessToken
      )
      
      // Convert descendants to our Reply format
      const replies = context.descendants
        .slice(0, limit)
        .map(status => this.convertStatusToReply(status))
      
      return replies
    } catch (error) {
      console.error('Error fetching Mastodon replies:', error)
      throw error
    }
  }
  
  /**
   * Get the original post status (useful for getting current reply count)
   */
  async getPostStatus(postRef: PostReference): Promise<MastodonStatus | null> {
    const session = this.getMastodonSession()
    if (!session) {
      return null
    }
    
    try {
      const status: MastodonStatus = await this.makeRequest(
        session.instance,
        `/statuses/${postRef.postId}`,
        session.accessToken
      )
      
      return status
    } catch (error) {
      console.error('Error fetching Mastodon post status:', error)
      return null
    }
  }
}

// Register the Mastodon fetcher with the global service
if (typeof window !== 'undefined') {
  import('./replyFetcher').then(({ getReplyFetcherService }) => {
    const service = getReplyFetcherService()
    service.registerFetcher('mastodon', new MastodonReplyFetcher())
  })
}