import { ThreadsSession } from '@/types/auth'

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID

if (!META_APP_ID) {
  console.warn('NEXT_PUBLIC_META_APP_ID not configured')
}

export class ThreadsAuth {
  private static readonly SCOPES = [
    'threads_basic',
    'threads_content_publish'
  ]

  static generateAuthUrl(): string {
    if (!META_APP_ID) {
      throw new Error('NEXT_PUBLIC_META_APP_ID not configured')
    }

    const redirectUri = `${window.location.origin}/auth/threads/callback`
    const scope = this.SCOPES.join(',')
    const state = this.generateState()
    
    // Store state for verification
    sessionStorage.setItem('threads_oauth_state', state)
    
    const authUrl = new URL('https://threads.net/oauth/authorize')
    authUrl.searchParams.set('client_id', META_APP_ID)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', scope)
    authUrl.searchParams.set('response_type', 'code')
    authUrl.searchParams.set('state', state)
    
    return authUrl.toString()
  }

  static async exchangeCodeForToken(code: string, state: string): Promise<ThreadsSession> {
    // Verify state parameter
    const storedState = sessionStorage.getItem('threads_oauth_state')
    if (!storedState || storedState !== state) {
      throw new Error('Invalid state parameter')
    }
    
    sessionStorage.removeItem('threads_oauth_state')

    const redirectUri = `${window.location.origin}/auth/threads/callback`
    
    // Call our server-side API to exchange the code for a token
    const response = await fetch('/api/auth/threads/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        redirectUri
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.session) {
      throw new Error('No session data received')
    }

    return data.session
  }


  static async verifyToken(accessToken: string): Promise<boolean> {
    try {
      // Simple verification by trying to get user info
      const userUrl = new URL('https://graph.threads.net/me')
      userUrl.searchParams.set('fields', 'id')
      userUrl.searchParams.set('access_token', accessToken)

      const response = await fetch(userUrl.toString())
      return response.ok
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  private static generateState(): string {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
  }
}