import { MastodonApp, MastodonAuthResponse, MastodonAccount, MastodonSession } from '@/types/auth'
import { SessionManager } from '@/lib/storage/sessionStorage'

export class MastodonAuth {
  private static readonly CLIENT_NAME = 'HyperYapper'
  private static readonly REDIRECT_URI = typeof window !== 'undefined' 
    ? `${window.location.origin}/auth/mastodon/callback`
    : 'http://localhost:3000/auth/mastodon/callback'
  private static readonly SCOPES = 'read write:statuses write:media'

  static async registerApp(instance: string): Promise<MastodonApp> {
    const instanceUrl = this.normalizeInstanceUrl(instance)
    
    const response = await fetch(`${instanceUrl}/api/v1/apps`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_name: this.CLIENT_NAME,
        redirect_uris: this.REDIRECT_URI,
        scopes: this.SCOPES,
        website: typeof window !== 'undefined' ? window.location.origin : 'https://hyperyapper.com',
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to register app: ${response.statusText}`)
    }

    const app: MastodonApp = await response.json()
    return app
  }

  static generateAuthUrl(instance: string, clientId: string): string {
    const instanceUrl = this.normalizeInstanceUrl(instance)
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: this.REDIRECT_URI,
      response_type: 'code',
      scope: this.SCOPES,
    })

    return `${instanceUrl}/oauth/authorize?${params.toString()}`
  }

  static async exchangeCodeForToken(
    instance: string,
    clientId: string,
    clientSecret: string,
    code: string
  ): Promise<MastodonAuthResponse> {
    const instanceUrl = this.normalizeInstanceUrl(instance)
    
    const response = await fetch(`${instanceUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: this.REDIRECT_URI,
        grant_type: 'authorization_code',
        code: code,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to exchange code for token: ${response.statusText}`)
    }

    return await response.json()
  }

  static async getAccount(instance: string, accessToken: string): Promise<MastodonAccount> {
    const instanceUrl = this.normalizeInstanceUrl(instance)
    
    const response = await fetch(`${instanceUrl}/api/v1/accounts/verify_credentials`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to get account info: ${response.statusText}`)
    }

    return await response.json()
  }

  static async createSession(
    instance: string,
    authResponse: MastodonAuthResponse,
    account: MastodonAccount
  ): Promise<MastodonSession> {
    const session: MastodonSession = {
      accessToken: authResponse.access_token,
      instance: this.normalizeInstanceUrl(instance),
      userId: account.id,
      username: account.username,
      displayName: account.display_name,
      avatar: account.avatar,
      createdAt: Date.now(),
      // Mastodon tokens don't typically expire, but we can set a long expiry
      expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 year
    }

    // Store in session manager
    const sessionManager = SessionManager.getInstance()
    sessionManager.setMastodonSession(session)

    return session
  }

  static async revokeToken(instance: string, accessToken: string): Promise<void> {
    const instanceUrl = this.normalizeInstanceUrl(instance)
    
    try {
      await fetch(`${instanceUrl}/oauth/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: accessToken,
        }),
      })
    } catch (error) {
      console.error('Failed to revoke token:', error)
    }
  }

  static logout(): void {
    const sessionManager = SessionManager.getInstance()
    const session = sessionManager.getMastodonSession()
    
    if (session) {
      // Revoke token on the server
      this.revokeToken(session.instance, session.accessToken)
      // Remove from local storage
      sessionManager.removeMastodonSession()
    }
  }

  static getCurrentSession(): MastodonSession | null {
    const sessionManager = SessionManager.getInstance()
    return sessionManager.getMastodonSession()
  }

  static isAuthenticated(): boolean {
    const sessionManager = SessionManager.getInstance()
    return sessionManager.isSessionValid('mastodon')
  }

  private static normalizeInstanceUrl(instance: string): string {
    let url = instance.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`
    }
    return url.replace(/\/$/, '') // Remove trailing slash
  }
}