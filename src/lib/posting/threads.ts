import { ThreadsSession } from '@/types/auth'
import { PostResult } from '@/types/post'

interface ThreadsMediaContainer {
  id: string
}

interface ThreadsPublishResponse {
  id: string
}

export class ThreadsPoster {
  private static readonly API_VERSION = 'v1.0'
  private static readonly BASE_URL = 'https://graph.threads.net'
  private static readonly PUBLISH_DELAY = 5000 // 5 seconds (minimum safe delay)

  static async post(session: ThreadsSession, content: string, images?: File[]): Promise<PostResult> {
    try {
      // Note: Threads API requires images to be hosted on a public URL
      // For now, we'll ignore images and post text only
      // TODO: Implement image hosting service to support image posts
      if (images && images.length > 0) {
        console.warn('Threads API requires hosted image URLs. Images will be ignored.')
      }

      // Step 1: Create media container for text post
      const container = await this.createMediaContainer(
        session.userInfo.id,
        session.accessToken,
        content
      )

      if (!container.id) {
        throw new Error('Failed to create media container')
      }

      // Step 2: Wait for processing (recommended by Threads docs)
      await this.delay(this.PUBLISH_DELAY)

      // Step 3: Publish the container
      const publishedPost = await this.publishContainer(
        session.userInfo.id,
        session.accessToken,
        container.id
      )

      return {
        platform: 'threads',
        success: true,
        postId: publishedPost.id,
        postUrl: `https://www.threads.net/@${session.userInfo.username}/post/${publishedPost.id}`
      }
    } catch (error) {
      console.error('Threads posting error:', error)
      return {
        platform: 'threads',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private static async createMediaContainer(
    userId: string,
    accessToken: string,
    text: string,
    linkAttachment?: string
  ): Promise<ThreadsMediaContainer> {
    const url = new URL(`${this.BASE_URL}/${this.API_VERSION}/${userId}/threads`)
    
    // Build form data
    const formData = new URLSearchParams()
    formData.append('media_type', 'TEXT')
    formData.append('text', text)
    formData.append('access_token', accessToken)
    
    // Add link attachment if provided (for text-only posts)
    if (linkAttachment) {
      formData.append('link_attachment', linkAttachment)
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || 
        errorData.error_message || 
        `Failed to create media container: ${response.status}`
      )
    }

    return await response.json()
  }

  private static async publishContainer(
    userId: string,
    accessToken: string,
    containerId: string
  ): Promise<ThreadsPublishResponse> {
    const url = new URL(`${this.BASE_URL}/${this.API_VERSION}/${userId}/threads_publish`)
    
    const formData = new URLSearchParams()
    formData.append('creation_id', containerId)
    formData.append('access_token', accessToken)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || 
        errorData.error_message || 
        `Failed to publish container: ${response.status}`
      )
    }

    return await response.json()
  }

  static async verifyConnection(session: ThreadsSession): Promise<boolean> {
    try {
      const url = new URL(`${this.BASE_URL}/${this.API_VERSION}/me`)
      url.searchParams.set('fields', 'id')
      url.searchParams.set('access_token', session.accessToken)

      const response = await fetch(url.toString())
      return response.ok
    } catch (error) {
      console.error('Threads connection verification failed:', error)
      return false
    }
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Helper to extract first URL from text for auto link preview
  static extractFirstUrl(text: string): string | undefined {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const match = text.match(urlRegex)
    return match ? match[0] : undefined
  }

  // Future methods for image/video posts
  static async postWithImage(
    session: ThreadsSession, 
    text: string, 
    imageUrl: string
  ): Promise<PostResult> {
    // TODO: Implement image posting
    return {
      platform: 'threads',
      success: false,
      error: 'Image posting not yet implemented'
    }
  }

  static async postWithVideo(
    session: ThreadsSession, 
    text: string, 
    videoUrl: string
  ): Promise<PostResult> {
    // TODO: Implement video posting
    return {
      platform: 'threads',
      success: false,
      error: 'Video posting not yet implemented'
    }
  }

  static async postCarousel(
    session: ThreadsSession,
    text: string,
    mediaUrls: { type: 'IMAGE' | 'VIDEO', url: string }[]
  ): Promise<PostResult> {
    // TODO: Implement carousel posting
    return {
      platform: 'threads',
      success: false,
      error: 'Carousel posting not yet implemented'
    }
  }
}