import { MastodonSession } from '@/types/auth'
import { PostResult, MastodonPostResponse } from '@/types/post'

interface MediaAttachment {
  id: string
  type: string
  url: string
  preview_url: string
}

export class MastodonPoster {
  static async post(session: MastodonSession, content: string, images?: File[]): Promise<PostResult> {
    try {
      // Upload images first if provided
      let mediaIds: string[] = []
      if (images && images.length > 0) {
        mediaIds = await this.uploadImages(session, images)
      }

      // Create the status with or without media
      const statusData: any = {
        status: content,
        visibility: 'public'
      }

      if (mediaIds.length > 0) {
        statusData.media_ids = mediaIds
        console.log('Creating status with media IDs:', mediaIds)
      }

      const response = await fetch(`${session.instance}/api/v1/statuses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(statusData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const postData: MastodonPostResponse = await response.json()

      return {
        platform: 'mastodon',
        success: true,
        postId: postData.id,
        postUrl: postData.url
      }
    } catch (error) {
      console.error('Mastodon posting error:', error)
      return {
        platform: 'mastodon',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  static async verifyConnection(session: MastodonSession): Promise<boolean> {
    try {
      const response = await fetch(`${session.instance}/api/v1/accounts/verify_credentials`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      })
      return response.ok
    } catch (error) {
      console.error('Mastodon connection verification failed:', error)
      return false
    }
  }

  private static async uploadImages(session: MastodonSession, images: File[]): Promise<string[]> {
    const mediaIds: string[] = []
    const errors: string[] = []

    // Ensure instance URL has protocol
    const instanceUrl = session.instance.startsWith('http') 
      ? session.instance 
      : `https://${session.instance}`

    for (const image of images) {
      try {
        console.log('Uploading image:', image.name, 'Size:', image.size, 'Type:', image.type)
        
        const formData = new FormData()
        formData.append('file', image)

        // Use v2 endpoint for async upload
        const response = await fetch(`${instanceUrl}/api/v2/media`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
          body: formData,
        })

        if (!response.ok) {
          const errorText = await response.text()
          let errorMessage = `Failed to upload ${image.name}`
          
          try {
            const errorData = JSON.parse(errorText)
            if (errorData.error) {
              errorMessage = errorData.error
            }
          } catch (e) {
            // Use generic error message
          }
          
          errors.push(errorMessage)
          console.error('Upload failed:', response.status, errorMessage)
          continue
        }

        const mediaData: MediaAttachment = await response.json()
        console.log('Media upload response:', mediaData)
        
        if (mediaData.id) {
          console.log('Image uploaded with ID:', mediaData.id)
          
          // If it's a 202 response, media is still processing - wait for it
          if (response.status === 202) {
            console.log('Media is processing asynchronously, waiting for completion...')
            const isReady = await this.waitForMediaProcessing(session, mediaData.id)
            if (!isReady) {
              errors.push(`Media processing failed for ${image.name}`)
              continue
            }
          }
          
          mediaIds.push(mediaData.id)
        }
      } catch (error) {
        const errorMessage = `Failed to upload ${image.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        errors.push(errorMessage)
        console.error('Error uploading image:', error)
      }
    }

    // If we had errors and no successful uploads, throw an error
    if (errors.length > 0 && mediaIds.length === 0) {
      throw new Error(errors.join(', '))
    }

    return mediaIds
  }

  private static async waitForMediaProcessing(session: MastodonSession, mediaId: string): Promise<boolean> {
    const instanceUrl = session.instance.startsWith('http') 
      ? session.instance 
      : `https://${session.instance}`

    const maxAttempts = 30 // Maximum 30 attempts
    const pollInterval = 1000 // Poll every second

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Checking media processing status (attempt ${attempt}/${maxAttempts})...`)
        
        const response = await fetch(`${instanceUrl}/api/v1/media/${mediaId}`, {
          headers: {
            'Authorization': `Bearer ${session.accessToken}`,
          },
        })

        if (!response.ok) {
          console.error('Failed to check media status:', response.status)
          return false
        }

        const mediaData: MediaAttachment = await response.json()
        
        // Check if media is ready (has a URL)
        if (mediaData.url && mediaData.url !== null) {
          console.log('Media processing complete!')
          return true
        }

        // If still processing, wait before next attempt
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval))
        }
      } catch (error) {
        console.error('Error checking media status:', error)
        return false
      }
    }

    console.error('Media processing timeout - max attempts reached')
    return false
  }
}