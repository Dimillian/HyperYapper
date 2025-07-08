import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { accessToken } = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing access token' },
        { status: 400 }
      )
    }

    // Refresh the long-lived token
    const tokenUrl = new URL('https://graph.threads.net/refresh_access_token')
    tokenUrl.searchParams.set('grant_type', 'th_refresh_token')
    tokenUrl.searchParams.set('access_token', accessToken)

    const response = await fetch(tokenUrl.toString())
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Token refresh failed:', errorData)
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to refresh token' },
        { status: 400 }
      )
    }

    const tokenData = await response.json()
    
    // Return refreshed token data
    const refreshedData = {
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in || 5184000, // 60 days
      tokenType: tokenData.token_type || 'bearer',
      refreshedAt: Date.now()
    }

    return NextResponse.json({ token: refreshedData })

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    )
  }
}