'use client'

import { useState, useEffect } from 'react'
import { MastodonAuth } from '@/lib/auth/mastodon'
import { SessionManager } from '@/lib/storage/sessionStorage'
import { MastodonSession } from '@/types/auth'
import { 
  Globe, 
  Plus, 
  LogOut, 
  User, 
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export function AccountManager() {
  const [mastodonSession, setMastodonSession] = useState<MastodonSession | null>(null)
  const [showMastodonConnect, setShowMastodonConnect] = useState(false)
  const [mastodonInstance, setMastodonInstance] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Load existing session
    const sessionManager = SessionManager.getInstance()
    const session = sessionManager.getMastodonSession()
    setMastodonSession(session)
  }, [])

  const handleMastodonConnect = async () => {
    if (!mastodonInstance.trim()) {
      setError('Please enter a Mastodon instance')
      return
    }

    setIsConnecting(true)
    setError('')

    try {
      // Register app with the instance
      const app = await MastodonAuth.registerApp(mastodonInstance)
      
      // Store app credentials temporarily
      sessionStorage.setItem('mastodon_app_data', JSON.stringify({
        instance: mastodonInstance,
        clientId: app.client_id,
        clientSecret: app.client_secret
      }))

      // Generate auth URL and redirect
      const authUrl = MastodonAuth.generateAuthUrl(mastodonInstance, app.client_id)
      window.location.href = authUrl

    } catch (err) {
      console.error('Failed to initiate Mastodon auth:', err)
      setError(err instanceof Error ? err.message : 'Failed to connect to Mastodon')
      setIsConnecting(false)
    }
  }

  const handleMastodonLogout = () => {
    MastodonAuth.logout()
    setMastodonSession(null)
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Connected Accounts</h3>
      
      {/* Mastodon Account */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-indigo-400" />
            <div>
              <h4 className="font-medium text-white">Mastodon</h4>
              {mastodonSession ? (
                <div className="flex items-center gap-2 text-sm text-purple-300/70">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span>@{mastodonSession.username}@{new URL(mastodonSession.instance).hostname}</span>
                </div>
              ) : (
                <p className="text-sm text-gray-400">Not connected</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mastodonSession ? (
              <>
                {mastodonSession.avatar && (
                  <img 
                    src={mastodonSession.avatar} 
                    alt={mastodonSession.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <button
                  onClick={handleMastodonLogout}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                  title="Disconnect Mastodon"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowMastodonConnect(!showMastodonConnect)}
                className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Connect
              </button>
            )}
          </div>
        </div>

        {/* Mastodon Connection Form */}
        {showMastodonConnect && !mastodonSession && (
          <div className="mt-4 pt-4 border-t border-purple-500/20">
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-purple-300/70 mb-2">
                  Mastodon Instance
                </label>
                <input
                  type="text"
                  value={mastodonInstance}
                  onChange={(e) => setMastodonInstance(e.target.value)}
                  placeholder="mastodon.social"
                  className="w-full px-3 py-2 bg-black/60 border border-purple-500/20 rounded-lg text-white placeholder-gray-500 focus:border-purple-400/50 focus:outline-none"
                  disabled={isConnecting}
                />
                <p className="text-xs text-purple-300/50 mt-1">
                  Enter your Mastodon instance domain (e.g., mastodon.social, fosstodon.org)
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleMastodonConnect}
                  disabled={isConnecting || !mastodonInstance.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {isConnecting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4" />
                      Connect to Mastodon
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowMastodonConnect(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  disabled={isConnecting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Coming Soon Platforms */}
      <div className="space-y-2">
        {[
          { name: 'X (Twitter)', icon: '𝕏', color: 'text-blue-400' },
          { name: 'Threads', icon: '📱', color: 'text-pink-400' },
          { name: 'BlueSky', icon: '🦋', color: 'text-sky-400' }
        ].map((platform) => (
          <div key={platform.name} className="glass-card p-4 opacity-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{platform.icon}</span>
                <div>
                  <h4 className="font-medium text-white">{platform.name}</h4>
                  <p className="text-sm text-gray-400">Coming soon</p>
                </div>
              </div>
              <button
                disabled
                className="px-3 py-2 bg-gray-700 text-gray-500 rounded-lg cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}