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
    let imageUrl: string | undefined
    let imageKey: string | undefined
    
    try {
      // Upload images to R2 if provided
      if (images && images.length > 0) {
        // Threads supports only 1 image per post, so use the first one
        const uploadResult = await this.uploadImageToR2(images[0])
        imageUrl = uploadResult.url
        imageKey = uploadResult.key
      }

      // Step 1: Create media container for text or image post
      const container = await this.createMediaContainer(
        session.userInfo.id,
        session.accessToken,
        content,
        imageUrl
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

      // Step 4: Clean up - delete the image from R2 after successful posting
      if (imageKey) {
        try {
          await this.deleteImageFromR2(imageKey)
        } catch (deleteError) {
          console.warn('Failed to delete image from R2:', deleteError)
          // Don't fail the post if cleanup fails
        }
      }

      return {
        platform: 'threads',
        success: true,
        postId: publishedPost.id,
        // Note: Threads API returns numeric ID but post URLs use alphanumeric shortcodes
        // The actual post URL format uses a different identifier not provided by the API
        postUrl: `https://www.threads.com/@${session.userInfo.username}`
      }
    } catch (error) {
      // Clean up image on error too
      if (imageKey) {
        try {
          await this.deleteImageFromR2(imageKey)
        } catch (deleteError) {
          console.warn('Failed to delete image from R2 during error cleanup:', deleteError)
        }
      }
      
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
    imageUrl?: string
  ): Promise<ThreadsMediaContainer> {
    const url = new URL(`${this.BASE_URL}/${this.API_VERSION}/${userId}/threads`)
    
    // Build form data
    const formData = new URLSearchParams()
    formData.append('access_token', accessToken)
    formData.append('text', text)
    
    // Set media type based on whether we have an image
    if (imageUrl) {
      formData.append('media_type', 'IMAGE')
      formData.append('image_url', imageUrl)
    } else {
      formData.append('media_type', 'TEXT')
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

  private static async uploadImageToR2(image: File): Promise<{ url: string; key: string }> {
    const formData = new FormData()
    formData.append('file', image)

    const response = await fetch('/api/upload-media', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to upload image')
    }

    const data = await response.json()
    return { url: data.url, key: data.key }
  }

  private static async deleteImageFromR2(key: string): Promise<void> {
    const response = await fetch('/api/delete-media', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to delete image')
    }
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