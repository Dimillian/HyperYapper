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

    // Exchange code for access token
    const tokenUrl = new URL('https://graph.facebook.com/v23.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', META_APP_ID)
    tokenUrl.searchParams.set('redirect_uri', redirectUri)
    tokenUrl.searchParams.set('client_secret', META_APP_SECRET)
    tokenUrl.searchParams.set('code', code)

    const tokenResponse = await fetch(tokenUrl.toString())
    
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

    // Get user information
    const userInfo = await getUserInfo(tokenData.access_token)
    
    // Return session data to client
    const sessionData = {
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in || 5184000, // Default 60 days
      tokenType: tokenData.token_type || 'bearer',
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

async function getUserInfo(accessToken: string): Promise<ThreadsUserInfo> {
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