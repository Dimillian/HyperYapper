import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')
    const accessToken = searchParams.get('accessToken')
    const fields = searchParams.get('fields') || 'id'

    if (!postId || !accessToken) {
      return NextResponse.json(
        { error: 'Missing postId or accessToken' },
        { status: 400 }
      )
    }

    // Make request to Threads API from server-side (no CORS issues)
    const response = await fetch(
      `https://graph.threads.net/v1.0/${postId}/replies?fields=${fields}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Threads API error:', response.status, errorText)
      return NextResponse.json(
        { error: `Threads API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error proxying Threads API request:', error)
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
      { status: 500 }
    )
  }
}