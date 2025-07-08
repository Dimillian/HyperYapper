'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ThreadsAuth } from '@/lib/auth/threads'
import { SessionManager } from '@/lib/storage/sessionStorage'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

export default function ThreadsCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code')
        const state = searchParams.get('state')
        const errorParam = searchParams.get('error')
        const errorReason = searchParams.get('error_reason')

        if (errorParam) {
          if (errorReason === 'user_denied') {
            setError('Authorization was cancelled by user')
          } else {
            setError(`OAuth error: ${errorParam}`)
          }
          setStatus('error')
          return
        }

        if (!code || !state) {
          setError('Missing authorization code or state parameter')
          setStatus('error')
          return
        }

        // Exchange code for access token
        const session = await ThreadsAuth.exchangeCodeForToken(code, state)
        
        // Store session
        const sessionManager = SessionManager.getInstance()
        sessionManager.setThreadsSession(session)
        
        // Dispatch session change event
        window.dispatchEvent(new CustomEvent('sessionChanged'))
        
        setStatus('success')
        
        // Redirect to home after a short delay
        setTimeout(() => {
          router.push('/')
        }, 2000)
        
      } catch (error) {
        console.error('Threads OAuth callback error:', error)
        setError(error instanceof Error ? error.message : 'Unknown error occurred')
        setStatus('error')
      }
    }

    handleCallback()
  }, [searchParams, router])

  const handleRetry = () => {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-purple-100 mb-2">
              Connecting to Threads
            </h1>
            <p className="text-purple-300">
              Please wait while we complete the authorization...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-purple-100 mb-2">
              Successfully Connected!
            </h1>
            <p className="text-purple-300 mb-4">
              Your Threads account has been connected successfully.
            </p>
            <p className="text-sm text-purple-400">
              Redirecting you back to the app...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-purple-100 mb-2">
              Connection Failed
            </h1>
            <p className="text-red-300 mb-4">
              {error || 'Failed to connect to Threads'}
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg transition-all duration-200 neon-glow hover:neon-glow-strong"
            >
              Back to App
            </button>
          </>
        )}
      </div>
    </div>
  )
}