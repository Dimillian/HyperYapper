import { ThreadsSession, ThreadsUserInfo } from '@/types/auth'

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
const META_APP_SECRET = process.env.META_APP_SECRET

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

    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/threads/callback`)
    const scope = encodeURIComponent(this.SCOPES.join(','))
    const state = this.generateState()
    
    // Store state for verification
    sessionStorage.setItem('threads_oauth_state', state)
    
    const authUrl = new URL('https://www.facebook.com/v23.0/dialog/oauth')
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

    if (!META_APP_ID || !META_APP_SECRET) {
      throw new Error('Meta app credentials not configured')
    }

    const redirectUri = `${window.location.origin}/auth/threads/callback`
    
    // Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v23.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', META_APP_ID)
    tokenUrl.searchParams.set('redirect_uri', redirectUri)
    tokenUrl.searchParams.set('client_secret', META_APP_SECRET)
    tokenUrl.searchParams.set('code', code)

    const response = await fetch(tokenUrl.toString())
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`)
    }

    const tokenData = await response.json()
    
    if (!tokenData.access_token) {
      throw new Error('No access token received')
    }

    // Get user information
    const userInfo = await this.getUserInfo(tokenData.access_token)
    
    return {
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in || 5184000, // Default 60 days
      tokenType: tokenData.token_type || 'bearer',
      userInfo,
      createdAt: Date.now()
    }
  }

  static async getUserInfo(accessToken: string): Promise<ThreadsUserInfo> {
    const userUrl = new URL('https://graph.facebook.com/v23.0/me')
    userUrl.searchParams.set('fields', 'id,username,name,threads_profile_picture_url,threads_biography')
    userUrl.searchParams.set('access_token', accessToken)

    const response = await fetch(userUrl.toString())
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `Failed to get user info: ${response.status}`)
    }

    const userData = await response.json()
    
    return {
      id: userData.id,
      username: userData.username || userData.name,
      name: userData.name,
      profilePictureUrl: userData.threads_profile_picture_url,
      biography: userData.threads_biography
    }
  }

  static async verifyToken(accessToken: string): Promise<boolean> {
    try {
      const debugUrl = new URL('https://graph.facebook.com/v23.0/debug_token')
      debugUrl.searchParams.set('input_token', accessToken)
      debugUrl.searchParams.set('access_token', `${META_APP_ID}|${META_APP_SECRET}`)

      const response = await fetch(debugUrl.toString())
      
      if (!response.ok) {
        return false
      }

      const debugData = await response.json()
      return debugData.data?.is_valid === true
    } catch (error) {
      console.error('Token verification failed:', error)
      return false
    }
  }

  private static generateState(): string {
    return Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2)
  }
}