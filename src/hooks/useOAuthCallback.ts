'use client'

import { useEffect } from 'react'
import { BlueSkyAuth } from '@/lib/auth/bluesky'

export const useOAuthCallback = () => {
  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Check both query string and URL fragment for OAuth parameters
      let urlParams = new URLSearchParams(window.location.search)
      let code = urlParams.get('code')
      let state = urlParams.get('state')
      let iss = urlParams.get('iss')
      
      // If not found in query string, check URL fragment
      if (!code && window.location.hash) {
        const fragmentParams = new URLSearchParams(window.location.hash.substring(1))
        code = fragmentParams.get('code')
        state = fragmentParams.get('state')
        iss = fragmentParams.get('iss')
        urlParams = fragmentParams
      }
      
      // Check if this is a BlueSky OAuth callback
      if (code && state && iss === 'https://bsky.social') {
        try {
          const session = await BlueSkyAuth.handleCallback(urlParams)
          if (session) {
            // Clean up the URL (remove both query and fragment)
            window.history.replaceState({}, document.title, window.location.pathname)
            // Trigger session change event
            window.dispatchEvent(new CustomEvent('sessionChanged'))
          }
        } catch (error) {
          console.error('Error handling BlueSky callback:', error)
        }
      }
    }
    
    handleOAuthCallback()
  }, [])
}