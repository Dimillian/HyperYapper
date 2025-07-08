import { SessionManager } from '@/lib/storage/sessionStorage'
import { MastodonPoster } from './mastodon'
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
              result = await MastodonPoster.post(mastodonSession, content.text)
            }
            break

          case 'twitter':
            result = {
              platform: 'twitter',
              success: false,
              error: 'Twitter posting not implemented yet'
            }
            break

          case 'threads':
            result = {
              platform: 'threads',
              success: false,
              error: 'Threads posting not implemented yet'
            }
            break

          case 'bluesky':
            result = {
              platform: 'bluesky',
              success: false,
              error: 'BlueSky posting not implemented yet'
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

        default:
          connectionStatus[platform] = false
      }
    }

    return connectionStatus
  }
}