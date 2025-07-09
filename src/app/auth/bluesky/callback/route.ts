import { NextRequest, NextResponse } from 'next/server'
import { BlueSkyAuth } from '@/lib/auth/bluesky'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  
  try {
    const session = await BlueSkyAuth.handleCallback(searchParams)
    
    if (session) {
      // Redirect to home page with success
      return NextResponse.redirect(new URL('/?auth=success&platform=bluesky', request.url))
    } else {
      // Redirect with error
      return NextResponse.redirect(new URL('/?auth=error&platform=bluesky', request.url))
    }
  } catch (error) {
    console.error('BlueSky callback error:', error)
    return NextResponse.redirect(new URL('/?auth=error&platform=bluesky', request.url))
  }
}