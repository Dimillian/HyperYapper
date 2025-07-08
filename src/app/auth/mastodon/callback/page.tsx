'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { MastodonAuth } from '@/lib/auth/mastodon'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

function MastodonCallbackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const error = searchParams.get('error')

        if (error) {
          throw new Error(`Authorization failed: ${error}`)
        }

        if (!code) {
          throw new Error('Authorization code not found')
        }

        // Get stored app credentials from sessionStorage (set during auth initiation)
        const storedAppData = sessionStorage.getItem('mastodon_app_data')
        if (!storedAppData) {
          throw new Error('App credentials not found')
        }

        const { instance, clientId, clientSecret } = JSON.parse(storedAppData)

        // Exchange code for access token
        const authResponse = await MastodonAuth.exchangeCodeForToken(
          instance,
          clientId,
          clientSecret,
          code
        )

        // Get account information
        const account = await MastodonAuth.getAccount(instance, authResponse.access_token)

        // Create and store session
        await MastodonAuth.createSession(instance, authResponse, account)

        // Clean up temporary storage
        sessionStorage.removeItem('mastodon_app_data')

        // Notify other components about session change
        window.dispatchEvent(new CustomEvent('sessionChanged'))

        setStatus('success')
        
        // Redirect to home after a short delay
        setTimeout(() => {
          router.push('/')
        }, 2000)

      } catch (err) {
        console.error('Mastodon auth callback error:', err)
        setError(err instanceof Error ? err.message : 'Unknown error occurred')
        setStatus('error')
      }
    }

    handleCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-purple-300 animate-spin mx-auto drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            <h2 className="text-xl font-bold text-purple-100 glow-text">Connecting to Mastodon...</h2>
            <p className="text-purple-200/80">Please wait while we complete your authentication.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
            <h2 className="text-xl font-bold text-purple-100 glow-text">Successfully Connected!</h2>
            <p className="text-purple-200/80">
              Your Mastodon account has been connected. Redirecting you back to HyperYapper...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <XCircle className="w-12 h-12 text-red-300 mx-auto drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
            <h2 className="text-xl font-bold text-purple-100 glow-text">Connection Failed</h2>
            <p className="text-purple-200/80 text-sm">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition-colors neon-glow font-medium"
            >
              Back to HyperYapper
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MastodonCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-purple-300 animate-spin mx-auto drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            <h2 className="text-xl font-bold text-purple-100 glow-text">Loading...</h2>
          </div>
        </div>
      </div>
    }>
      <MastodonCallbackContent />
    </Suspense>
  )
}