import { NextRequest, NextResponse } from 'next/server'
import { BlueSkyAuth } from '@/lib/auth/bluesky'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const handle = searchParams.get('handle')
  
  if (!handle) {
    return NextResponse.json({ error: 'Handle is required' }, { status: 400 })
  }

  try {
    const authUrl = await BlueSkyAuth.initiateLogin(handle)
    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error('BlueSky auth error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate BlueSky authentication' }, 
      { status: 500 }
    )
  }
}