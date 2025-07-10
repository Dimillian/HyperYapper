/**
 * Threads-specific reply fetching implementation using Meta Graph API
 */

import { ReplyFetcher, Reply, ReplyFetchResult } from './replyFetcher'
import { PostReference } from '@/components/notifications/types'
import { ThreadsSession } from '@/types/auth'
import { SessionManager } from '@/lib/storage/sessionStorage'

interface ThreadsReply {
  id: string
  text?: string
  timestamp: string
  has_replies: boolean
  hide_status: string
}

export class ThreadsReplyFetcher implements ReplyFetcher {
  private sessionManager = SessionManager.getInstance()
  
  /**
   * Check if Threads service is available (user is authenticated)
   */
  async isAvailable(): Promise<boolean> {
    const session = this.sessionManager.getThreadsSession()
    return session !== null
  }
  
  /**
   * Get the Threads session
   */
  private getThreadsSession(): ThreadsSession | null {
    return this.sessionManager.getThreadsSession()
  }
  
  /**
   * Make authenticated request to Threads API
   */
  private async makeRequest(endpoint: string): Promise<any> {
    const session = this.getThreadsSession()
    if (!session) {
      throw new Error('No Threads session found')
    }

    const response = await fetch(`https://graph.threads.net/v1.0/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Threads API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }
  
  /**
   * Fetch reply count for a specific Threads post
   */
  async fetchReplyCount(postRef: PostReference): Promise<ReplyFetchResult> {
    try {
      // Fetch replies to count them
      const response = await this.makeRequest(
        `${postRef.postId}/replies?fields=id`
      )

      // Count the replies in the response
      const replyCount = response.data ? response.data.length : 0
      
      // For now, we'll consider all replies as "unread" since we don't have 
      // a mechanism to track read state yet
      const hasUnread = replyCount > 0
      
      return {
        platform: 'threads',
        postId: postRef.postId,
        count: replyCount,
        hasUnread,
        replies: [] // No need to fetch actual replies for count-only operation
      }
    } catch (error) {
      console.error('Error fetching Threads reply count:', error)
      
      return {
        platform: 'threads',
        postId: postRef.postId,
        count: 0,
        hasUnread: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Fetch actual replies for a Threads post
   */
  async fetchReplies(postRef: PostReference, limit: number = 50): Promise<Reply[]> {
    try {
      // Get top-level replies with full data
      const response = await this.makeRequest(
        `${postRef.postId}/replies?fields=id,text,timestamp,username,permalink`
      )

      const replies = response.data || []
      
      // Convert to our Reply format and limit results
      return replies.slice(0, limit).map((reply: any) => ({
        id: reply.id,
        content: reply.text || '',
        author: {
          username: reply.username || 'Unknown',
          displayName: reply.username || 'Unknown',
          avatar: '' // Threads API doesn't provide avatar in replies endpoint
        },
        timestamp: new Date(reply.timestamp).getTime(),
        url: reply.permalink || ''
      }))
      
    } catch (error) {
      console.error('Error fetching Threads replies:', error)
      throw error
    }
  }
}

// Register the Threads fetcher with the global service
if (typeof window !== 'undefined') {
  import('./replyFetcher').then(({ getReplyFetcherService }) => {
    const service = getReplyFetcherService()
    service.registerFetcher('threads', new ThreadsReplyFetcher())
  })
}