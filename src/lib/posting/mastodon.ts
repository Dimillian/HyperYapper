import { MastodonSession } from '@/types/auth'
import { PostResult, MastodonPostResponse } from '@/types/post'

export class MastodonPoster {
  static async post(session: MastodonSession, content: string): Promise<PostResult> {
    try {
      const response = await fetch(`${session.instance}/api/v1/statuses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: content,
          visibility: 'public'
        }),
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
}