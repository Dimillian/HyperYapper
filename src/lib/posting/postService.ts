import { SessionManager } from '@/lib/storage/sessionStorage'
import { MastodonPoster } from './mastodon'
import { ThreadsPoster } from './threads'
import { BlueSkyPoster } from './bluesky'
import { PostContent, PostResult, PostStatus } from '@/types/post'

export class PostService {
  static async postToAll(
    content: PostContent, 
    onProgress?: (platform: string, result: PostResult) => void
  ): Promise<PostStatus> {
    const sessionManager = SessionManager.getInstance()
    const errors: string[] = []

    // Create initial pending results for all platforms
    const initialResults: PostResult[] = content.platforms.map(platform => ({
      platform,
      success: false,
      status: 'pending'
    }))

    // Post to all platforms in parallel
    const postPromises = content.platforms.map(async (platform): Promise<PostResult> => {
      try {
        // Update status to posting
        const postingResult: PostResult = {
          platform,
          success: false,
          status: 'posting'
        }
        onProgress?.(platform, postingResult)

        let result: PostResult

        switch (platform) {
          case 'mastodon':
            const mastodonSession = sessionManager.getMastodonSession()
            if (!mastodonSession) {
              result = {
                platform: 'mastodon',
                success: false,
                error: 'Mastodon account not connected',
                status: 'failed'
              }
            } else {
              result = await MastodonPoster.post(mastodonSession, content.text, content.images)
              result.status = result.success ? 'completed' : 'failed'
            }
            break

          case 'threads':
            const threadsSession = sessionManager.getThreadsSession()
            if (!threadsSession) {
              result = {
                platform: 'threads',
                success: false,
                error: 'Threads account not connected',
                status: 'failed'
              }
            } else {
              result = await ThreadsPoster.post(threadsSession, content.text, content.images)
              result.status = result.success ? 'completed' : 'failed'
            }
            break

          case 'bluesky':
            const blueSkySession = sessionManager.getBlueSkySession()
            if (!blueSkySession) {
              result = {
                platform: 'bluesky',
                success: false,
                error: 'BlueSky account not connected',
                status: 'failed'
              }
            } else {
              result = await BlueSkyPoster.post(blueSkySession, content.text, content.images)
              result.status = result.success ? 'completed' : 'failed'
            }
            break

          default:
            result = {
              platform,
              success: false,
              error: `Unknown platform: ${platform}`,
              status: 'failed'
            }
        }

        // Notify progress
        onProgress?.(platform, result)

        if (!result.success && result.error) {
          errors.push(`${platform}: ${result.error}`)
        }

        return result
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const failedResult: PostResult = {
          platform,
          success: false,
          error: errorMessage,
          status: 'failed'
        }
        
        onProgress?.(platform, failedResult)
        errors.push(`${platform}: ${errorMessage}`)
        return failedResult
      }
    })

    // Wait for all posts to complete
    const results = await Promise.all(postPromises)

    return {
      isPosting: false,
      results,
      errors
    }
  }

  static async verifyConnections(platforms: string[]): Promise<Record<string, boolean>> {
    const sessionManager = SessionManager.getInstance()
    const connectionStatus: Record<string, boolean> = {}

    for (const platform of platforms) {
      switch (platform) {
        case 'mastodon':
          const mastodonSession = sessionManager.getMastodonSession()
          if (mastodonSession) {
            connectionStatus[platform] = await MastodonPoster.verifyConnection(mastodonSession)
          } else {
            connectionStatus[platform] = false
          }
          break

        case 'threads':
          const threadsSession = sessionManager.getThreadsSession()
          if (threadsSession) {
            connectionStatus[platform] = await ThreadsPoster.verifyConnection(threadsSession)
          } else {
            connectionStatus[platform] = false
          }
          break

        case 'bluesky':
          const blueSkySession = sessionManager.getBlueSkySession()
          if (blueSkySession) {
            connectionStatus[platform] = await BlueSkyPoster.verifyConnection(blueSkySession)
          } else {
            connectionStatus[platform] = false
          }
          break

        default:
          connectionStatus[platform] = false
      }
    }

    return connectionStatus
  }
}