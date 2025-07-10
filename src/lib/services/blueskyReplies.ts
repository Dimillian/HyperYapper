/**
 * Bluesky-specific reply fetching implementation using AT Protocol
 */

import { ReplyFetcher, Reply, ReplyFetchResult } from './replyFetcher'
import { PostReference } from '@/components/notifications/types'
import { BlueSkySession } from '@/types/auth'
import { SessionManager } from '@/lib/storage/sessionStorage'

interface BlueskyPost {
  uri: string
  value: {
    text: string
    createdAt: string
    replyCount?: number
  }
  author: {
    did: string
    handle: string
    displayName?: string
    avatar?: string
  }
}

export class BlueskyReplyFetcher implements ReplyFetcher {
  private sessionManager = SessionManager.getInstance()
  
  /**
   * Check if Bluesky service is available (user is authenticated)
   */
  async isAvailable(): Promise<boolean> {
    const session = this.sessionManager.getBlueSkySession()
    return session !== null
  }
  
  /**
   * Get the Bluesky session
   */
  private getBlueskySession(): BlueSkySession | null {
    return this.sessionManager.getBlueSkySession()
  }
  
  /**
   * Make authenticated request to Bluesky API
   */
  private async makeRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const session = this.getBlueskySession()
    if (!session) {
      throw new Error('No Bluesky session found')
    }

    // Use the stored JWT token for authentication
    const accessToken = session.accessJwt
    if (!accessToken) {
      throw new Error('No access token available')
    }

    // Build URL with query parameters
    const url = new URL(`https://bsky.social/xrpc/${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })
    
    if (!response.ok) {
      throw new Error(`Bluesky API error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }
  
  
  /**
   * Fetch reply count for a specific Bluesky post
   */
  async fetchReplyCount(postRef: PostReference): Promise<ReplyFetchResult> {
    try {
      console.log('Bluesky fetchReplyCount called with postRef:', postRef)
      
      // For Bluesky, we need to use the postUri (AT-URI) to get the post
      if (!postRef.postUri) {
        console.error('Missing postUri for Bluesky post:', postRef)
        throw new Error('Bluesky post URI is required for reply fetching')
      }

      console.log('Fetching Bluesky thread for URI:', postRef.postUri)

      // Fetch the thread to get top-level replies and count them
      const thread = await this.makeRequest('app.bsky.feed.getPostThread', {
        uri: postRef.postUri,
        depth: 1 // Only top-level replies
      })

      console.log('Bluesky thread response:', thread)
      
      // Count the replies in the thread
      const replies = thread.thread?.replies || []
      const replyCount = replies.length
      
      console.log('Bluesky replies found:', replyCount, replies)
      
      // For now, we'll consider all replies as "unread" since we don't have 
      // a mechanism to track read state yet
      const hasUnread = replyCount > 0
      
      return {
        platform: 'bluesky',
        postId: postRef.postId,
        count: replyCount,
        hasUnread,
        replies: [] // No need to fetch actual replies for count-only operation
      }
    } catch (error) {
      console.error('Error fetching Bluesky reply count:', error)
      
      return {
        platform: 'bluesky',
        postId: postRef.postId,
        count: 0,
        hasUnread: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
  
  /**
   * Fetch actual replies for a Bluesky post
   */
  async fetchReplies(postRef: PostReference, limit: number = 50): Promise<Reply[]> {
    try {
      if (!postRef.postUri) {
        throw new Error('Bluesky post URI is required for reply fetching')
      }

      // Get top-level replies
      const thread = await this.makeRequest('app.bsky.feed.getPostThread', {
        uri: postRef.postUri,
        depth: 1
      })

      const replies = thread.thread?.replies || []
      
      // Convert to our Reply format and limit results
      return replies.slice(0, limit).map((reply: any) => ({
        id: reply.post.uri,
        content: reply.post.value.text,
        author: {
          username: reply.post.author.handle,
          displayName: reply.post.author.displayName || reply.post.author.handle,
          avatar: reply.post.author.avatar || ''
        },
        timestamp: new Date(reply.post.value.createdAt).getTime(),
        url: `https://bsky.app/profile/${reply.post.author.handle}/post/${reply.post.uri.split('/').pop()}`
      }))
      
    } catch (error) {
      console.error('Error fetching Bluesky replies:', error)
      throw error
    }
  }
  
  /**
   * Get the original post data (useful for getting current reply count)
   */
  async getPostData(postRef: PostReference): Promise<BlueskyPost | null> {
    try {
      if (!postRef.postUri) {
        return null
      }

      const postData = await this.makeRequest('com.atproto.repo.getRecord', {
        repo: postRef.postUri.split('//')[1].split('/')[0],
        collection: 'app.bsky.feed.post',
        rkey: postRef.postUri.split('/').pop() || postRef.postId
      })
      
      return postData.value ? { uri: postRef.postUri, value: postData.value, author: postData.value.author } : null
    } catch (error) {
      console.error('Error fetching Bluesky post data:', error)
      return null
    }
  }
}

// Register the Bluesky fetcher with the global service
if (typeof window !== 'undefined') {
  import('./replyFetcher').then(({ getReplyFetcherService }) => {
    const service = getReplyFetcherService()
    service.registerFetcher('bluesky', new BlueskyReplyFetcher())
  })
}