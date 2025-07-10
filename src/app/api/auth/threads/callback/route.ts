import { NextRequest, NextResponse } from 'next/server'
import { ThreadsUserInfo } from '@/types/auth'

const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID
const META_APP_SECRET = process.env.META_APP_SECRET

export async function POST(request: NextRequest) {
  try {
    const { code, redirectUri } = await request.json()

    if (!code || !redirectUri) {
      return NextResponse.json(
        { error: 'Missing code or redirectUri' },
        { status: 400 }
      )
    }

    if (!META_APP_ID || !META_APP_SECRET) {
      console.error('Missing Meta app credentials')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Exchange code for access token (using correct Threads API endpoint)
    const tokenResponse = await fetch('https://graph.threads.net/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: META_APP_ID,
        client_secret: META_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code: code
      })
    })
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      console.error('Token exchange failed:', errorData)
      return NextResponse.json(
        { error: errorData.error?.message || `HTTP ${tokenResponse.status}: ${tokenResponse.statusText}` },
        { status: 400 }
      )
    }

    const tokenData = await tokenResponse.json()
    
    if (!tokenData.access_token) {
      console.error('No access token received:', tokenData)
      return NextResponse.json(
        { error: 'No access token received' },
        { status: 400 }
      )
    }

    // Exchange short-lived token for long-lived token
    const longLivedToken = await exchangeForLongLivedToken(tokenData.access_token)
    
    // Get user information
    const userInfo = await getUserInfo(longLivedToken.access_token)
    
    // Return session data to client
    const sessionData = {
      accessToken: longLivedToken.access_token,
      expiresIn: longLivedToken.expires_in || 5184000, // 60 days for long-lived tokens
      tokenType: longLivedToken.token_type || 'bearer',
      userInfo,
      createdAt: Date.now()
    }

    return NextResponse.json({ session: sessionData })

  } catch (error) {
    console.error('Threads OAuth callback error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}

async function exchangeForLongLivedToken(shortLivedToken: string): Promise<{access_token: string, token_type: string, expires_in: number}> {
  // Use POST method for long-lived token exchange
  const response = await fetch('https://graph.threads.net/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'th_exchange_token',
      client_secret: META_APP_SECRET!,
      access_token: shortLivedToken
    })
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Long-lived token exchange failed:', errorData)
    // If long-lived token exchange fails, return the short-lived token
    return {
      access_token: shortLivedToken,
      token_type: 'bearer',
      expires_in: 3600 // 1 hour for short-lived tokens
    }
  }

  const tokenData = await response.json()
  return {
    access_token: tokenData.access_token,
    token_type: tokenData.token_type || 'bearer',
    expires_in: tokenData.expires_in || 5184000 // 60 days default
  }
}

async function getUserInfo(accessToken: string): Promise<ThreadsUserInfo> {
  const userUrl = new URL('https://graph.threads.net/me')
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