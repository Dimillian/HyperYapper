import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production'
  const host = request.headers.get('host')
  
  let clientMetadata
  
  if (isProduction || host?.includes('hyperyapper.app')) {
    // Always use www as the canonical domain
    clientMetadata = {
      "client_id": "https://www.hyperyapper.app/.well-known/oauth-client-metadata",
      "client_name": "HyperYapper",
      "client_uri": "https://www.hyperyapper.app",
      "logo_uri": "https://www.hyperyapper.app/icon.png",
      "policy_uri": "https://github.com/Dimillian/HyperYapper/blob/main/PRIVACY.md",
      "tos_uri": "https://github.com/Dimillian/HyperYapper/blob/main/TERMS.md",
      "redirect_uris": [
        "https://www.hyperyapper.app/auth/bluesky/callback"
      ],
      "scope": "atproto transition:generic",
      "grant_types": ["authorization_code", "refresh_token"],
      "response_types": ["code"],
      "token_endpoint_auth_method": "none",
      "application_type": "web",
      "dpop_bound_access_tokens": true
    }
  } else {
    // Development metadata
    clientMetadata = {
      "client_id": "http://127.0.0.1:3000/.well-known/oauth-client-metadata",
      "client_name": "HyperYapper (Dev)",
      "client_uri": "http://127.0.0.1:3000",
      "logo_uri": "http://127.0.0.1:3000/icon.png",
      "policy_uri": "https://github.com/Dimillian/HyperYapper/blob/main/PRIVACY.md",
      "tos_uri": "https://github.com/Dimillian/HyperYapper/blob/main/TERMS.md",
      "redirect_uris": ["http://127.0.0.1:3000/auth/bluesky/callback"],
      "scope": "atproto transition:generic",
      "grant_types": ["authorization_code", "refresh_token"],
      "response_types": ["code"],
      "token_endpoint_auth_method": "none",
      "application_type": "web",
      "dpop_bound_access_tokens": true
    }
  }
  
  return NextResponse.json(clientMetadata, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate' // No caching during development
    }
  })
}