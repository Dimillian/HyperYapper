import { SessionManager } from '@/lib/storage/sessionStorage'
import { MastodonPoster } from './mastodon'
import { ThreadsPoster } from './threads'
import { BlueSkyPoster } from './bluesky'
import { PostContent, PostResult, PostStatus } from '@/types/post'

export class PostService {
  static async postToAll(content: PostContent): Promise<PostStatus> {
    const sessionManager = SessionManager.getInstance()
    const results: PostResult[] = []
    const errors: string[] = []

    // Post to each selected platform
    for (const platform of content.platforms) {
      try {
        let result: PostResult

        switch (platform) {
          case 'mastodon':
            const mastodonSession = sessionManager.getMastodonSession()
            if (!mastodonSession) {
              result = {
                platform: 'mastodon',
                success: false,
                error: 'Mastodon account not connected'
              }
            } else {
              result = await MastodonPoster.post(mastodonSession, content.text, content.images)
            }
            break


          case 'threads':
            const threadsSession = sessionManager.getThreadsSession()
            if (!threadsSession) {
              result = {
                platform: 'threads',
                success: false,
                error: 'Threads account not connected'
              }
            } else {
              result = await ThreadsPoster.post(threadsSession, content.text, content.images)
            }
            break

          case 'bluesky':
            const blueSkySession = sessionManager.getBlueSkySession()
            if (!blueSkySession) {
              result = {
                platform: 'bluesky',
                success: false,
                error: 'BlueSky account not connected'
              }
            } else {
              result = await BlueSkyPoster.post(blueSkySession, content.text, content.images)
            }
            break

          default:
            result = {
              platform,
              success: false,
              error: `Unknown platform: ${platform}`
            }
        }

        results.push(result)

        if (!result.success && result.error) {
          errors.push(`${platform}: ${result.error}`)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.push({
          platform,
          success: false,
          error: errorMessage
        })
        errors.push(`${platform}: ${errorMessage}`)
      }
    }

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