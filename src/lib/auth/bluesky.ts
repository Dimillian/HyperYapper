'use client'

import { BlueSkySession } from '@/types/auth'

const STORAGE_KEY = 'hyperyapper_bluesky_session'

export class BlueSkyAuth {
  private static oauthClient: any = null

  static async initializeOAuthClient(): Promise<any> {
    // Force recreate client to pick up new metadata
    this.oauthClient = null
    
    // Only initialize on client-side
    if (typeof window === 'undefined') {
      throw new Error('BlueSky OAuth client can only be initialized on the client side')
    }

    const { BrowserOAuthClient } = await import('@atproto/oauth-client-browser')
    
    // Determine the client setup based on environment
    const isProduction = window.location.hostname.includes('hyperyapper.app')
    
    if (isProduction) {
      // Use explicit client metadata for production
      this.oauthClient = await BrowserOAuthClient.load({
        clientId: 'https://www.hyperyapper.app/.well-known/oauth-client-metadata',
        handleResolver: 'https://bsky.social'
      })
    } else {
      // Use explicit client metadata for development too
      this.oauthClient = await BrowserOAuthClient.load({
        clientId: 'http://127.0.0.1:3000/.well-known/oauth-client-metadata',
        handleResolver: 'https://bsky.social'
      })
    }

    return this.oauthClient
  }

  static async initiateLogin(handle: string): Promise<string> {
    try {
      const client = await this.initializeOAuthClient()
      
      // For BlueSky, we need to resolve the handle to get the PDS URL
      // The client metadata declares the required scopes
      const authUrl = await client.authorize(handle)
      
      return authUrl.toString()
    } catch (error) {
      console.error('Error initiating BlueSky login:', error)
      throw new Error('Failed to initiate BlueSky login')
    }
  }

  static async handleCallback(params: URLSearchParams): Promise<BlueSkySession | null> {
    try {
      const client = await this.initializeOAuthClient()
      
      // Handle the OAuth callback
      const { session } = await client.callback(params)
      
      if (!session) {
        throw new Error('No session returned from callback')
      }

      
      // Store the OAuth session in the client for future use
      this.oauthClient = client

      // Try to get user info from the session info endpoint
      let handle = 'unknown'
      let email = undefined
      
      try {
        // First try to get session info
        const userInfo = await session.fetchHandler(
          '/xrpc/com.atproto.server.getSession',
          { method: 'GET' }
        )
        
        if (userInfo.ok) {
          const userData = await userInfo.json()
          handle = userData.handle
          email = userData.email
        } else {
          // Try to resolve DID to handle using PLC directory
          try {
            const identityResponse = await fetch(
              `https://plc.directory/${session.did}`
            )
            if (identityResponse.ok) {
              const didDocument = await identityResponse.json()
              // Look for handle in the DID document's alsoKnownAs array
              const handleClaim = didDocument.alsoKnownAs?.find((aka: string) => aka.startsWith('at://'))
              if (handleClaim) {
                handle = handleClaim.replace('at://', '')
              } else {
                handle = session.did
              }
            } else {
              handle = session.did
            }
          } catch (resolveError) {
            handle = session.did
          }
        }
      } catch (error) {
        handle = session.did
      }

      const blueSkySession: BlueSkySession = {
        did: session.did,
        handle: handle,
        email: email,
        accessJwt: 'stored-in-oauth-client', // The OAuth client manages tokens internally
        refreshJwt: 'stored-in-oauth-client', // The OAuth client manages tokens internally
        active: true
      }

      // Store session
      await this.storeSession(blueSkySession)
      
      // Also store the session in the SessionManager
      const sessionManager = (await import('@/lib/storage/sessionStorage')).SessionManager.getInstance()
      sessionManager.setBlueSkySession(blueSkySession)
      
      return blueSkySession
    } catch (error) {
      console.error('Error handling BlueSky callback:', error)
      return null
    }
  }

  static async storeSession(session: BlueSkySession): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    }
  }

  static getStoredSession(): BlueSkySession | null {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  static async refreshSession(session: BlueSkySession): Promise<BlueSkySession | null> {
    try {
      const client = await this.initializeOAuthClient()
      
      // The OAuth client handles token refresh internally
      // We just need to restore the session and it will refresh if needed
      const oauthSession = await client.restore(session.did)
      
      if (!oauthSession) {
        return null
      }

      const updatedSession: BlueSkySession = {
        ...session,
        accessJwt: 'stored-in-oauth-client',
        refreshJwt: 'stored-in-oauth-client'
      }

      await this.storeSession(updatedSession)
      return updatedSession
    } catch (error) {
      console.error('Error refreshing BlueSky session:', error)
      return null
    }
  }

  static async verifySession(session: BlueSkySession): Promise<boolean> {
    try {
      const client = await this.initializeOAuthClient()
      const oauthSession = await client.restore(session.did)
      
      if (!oauthSession) {
        return false
      }

      const response = await oauthSession.fetchHandler(
        '/xrpc/com.atproto.server.getSession',
        { method: 'GET' }
      )
      
      return response.ok
    } catch (error) {
      console.error('Error verifying BlueSky session:', error)
      return false
    }
  }

  static logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
    this.oauthClient = null
  }
}