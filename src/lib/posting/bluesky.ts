import { BlueSkyService } from '@/lib/services/bluesky'
import { BlueSkySession } from '@/types/auth'
import { PostResult } from '@/types/post'

export class BlueSkyPoster {
  static async post(
    session: BlueSkySession,
    text: string,
    images?: File[]
  ): Promise<PostResult> {
    try {
      let response

      if (images && images.length > 0) {
        // BlueSky supports up to 4 images per post
        if (images.length > 4) {
          return {
            platform: 'bluesky',
            success: false,
            error: 'BlueSky only supports up to 4 images per post'
          }
        }

        // For now, we'll post with the first image
        // TODO: Implement multi-image support
        response = await BlueSkyService.createPostWithImage(
          session,
          { text },
          images[0],
          '' // TODO: Add alt text support
        )
      } else {
        response = await BlueSkyService.createPost(session, { text })
      }

      if (response) {
        // Extract the post ID from the URI for the URL
        // URI format: at://did:plc:xxx/app.bsky.feed.post/postId
        const postId = response.uri.split('/').pop()
        const postUrl = `https://bsky.app/profile/${session.handle}/post/${postId}`
        
        return {
          platform: 'bluesky',
          success: true,
          postId: response.uri,
          postUrl: postUrl
        }
      } else {
        return {
          platform: 'bluesky',
          success: false,
          error: 'Failed to create post'
        }
      }
    } catch (error) {
      console.error('BlueSky posting error:', error)
      return {
        platform: 'bluesky',
        success: false,
        error: error instanceof Error ? error.message : 'Failed to post to BlueSky'
      }
    }
  }

  static async verifyConnection(session: BlueSkySession): Promise<boolean> {
    try {
      const { BlueSkyAuth } = await import('@/lib/auth/bluesky')
      return await BlueSkyAuth.verifySession(session)
    } catch (error) {
      console.error('BlueSky connection verification error:', error)
      return false
    }
  }
}