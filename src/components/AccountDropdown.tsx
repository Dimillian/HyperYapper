'use client'

import { useState, useEffect, useRef } from 'react'
import { MastodonAuth } from '@/lib/auth/mastodon'
import { SessionManager } from '@/lib/storage/sessionStorage'
import { MastodonSession } from '@/types/auth'
import { 
  User, 
  ChevronDown, 
  Globe, 
  Plus, 
  LogOut, 
  ExternalLink,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'

export function AccountDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [mastodonSession, setMastodonSession] = useState<MastodonSession | null>(null)
  const [showMastodonConnect, setShowMastodonConnect] = useState(false)
  const [mastodonInstance, setMastodonInstance] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load existing session
    const sessionManager = SessionManager.getInstance()
    const session = sessionManager.getMastodonSession()
    setMastodonSession(session)
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowMastodonConnect(false)
      }
    }

    // Open dropdown when requested from other components
    const handleOpenDropdown = () => {
      setIsOpen(true)
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('openAccountDropdown', handleOpenDropdown)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('openAccountDropdown', handleOpenDropdown)
    }
  }, [])

  const handleMastodonConnect = async () => {
    if (!mastodonInstance.trim()) {
      setError('Please enter a Mastodon instance')
      return
    }

    setIsConnecting(true)
    setError('')

    try {
      const app = await MastodonAuth.registerApp(mastodonInstance)
      
      sessionStorage.setItem('mastodon_app_data', JSON.stringify({
        instance: mastodonInstance,
        clientId: app.client_id,
        clientSecret: app.client_secret
      }))

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
    setIsOpen(false)
    // Notify other components about session change
    window.dispatchEvent(new CustomEvent('sessionChanged'))
  }

  const connectedCount = mastodonSession ? 1 : 0

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-purple-500/30 hover:bg-purple-500/40 border border-purple-300/50 rounded-lg transition-all duration-200 neon-glow hover:neon-glow-strong"
      >
        {mastodonSession && mastodonSession.avatar ? (
          <img 
            src={mastodonSession.avatar} 
            alt={mastodonSession.displayName}
            className="w-6 h-6 rounded-full border border-purple-300/40"
          />
        ) : (
          <User className="w-5 h-5 text-purple-300" />
        )}
        <span className="text-sm text-purple-100 font-medium">
          {connectedCount > 0 ? `${connectedCount} connected` : 'Connect accounts'}
        </span>
        <ChevronDown className={`w-4 h-4 text-purple-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 glass-card border border-purple-300/40 rounded-lg shadow-xl z-50 bright-glow">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-purple-100 mb-3 glow-text">Account Management</h3>
            
            {/* Mastodon Account */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-black/60 rounded-lg border border-purple-400/20">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-indigo-300 drop-shadow-[0_0_4px_rgba(129,140,248,0.6)]" />
                  <div>
                    <div className="font-medium text-purple-100 text-sm">Mastodon</div>
                    {mastodonSession ? (
                      <div className="flex items-center gap-1 text-xs text-purple-200/80">
                        <CheckCircle className="w-3 h-3 text-green-300 drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]" />
                        <span>@{mastodonSession.username}@{new URL(mastodonSession.instance).hostname}</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-300">Not connected</div>
                    )}
                  </div>
                </div>

                {mastodonSession ? (
                  <div className="flex items-center gap-2">
                    {mastodonSession.avatar && (
                      <img 
                        src={mastodonSession.avatar} 
                        alt={mastodonSession.displayName}
                        className="w-6 h-6 rounded-full border border-purple-300/40"
                      />
                    )}
                    <button
                      onClick={handleMastodonLogout}
                      className="p-1 text-purple-300 hover:text-red-300 transition-colors"
                      title="Disconnect"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMastodonConnect(!showMastodonConnect)}
                    className="flex items-center gap-1 px-2 py-1 bg-purple-500/30 hover:bg-purple-500/40 text-purple-100 rounded text-xs transition-colors neon-glow"
                  >
                    <Plus className="w-3 h-3" />
                    Connect
                  </button>
                )}
              </div>

              {/* Mastodon Connect Form */}
              {showMastodonConnect && !mastodonSession && (
                <div className="p-3 bg-black/40 rounded-lg border border-purple-400/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-purple-100">Connect Mastodon</h4>
                    <button
                      onClick={() => setShowMastodonConnect(false)}
                      className="text-purple-300 hover:text-purple-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    value={mastodonInstance}
                    onChange={(e) => setMastodonInstance(e.target.value)}
                    placeholder="mastodon.social"
                    className="w-full px-3 py-2 bg-black/60 border border-purple-400/30 rounded text-purple-100 placeholder-purple-300/50 text-sm focus:border-purple-300/60 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                    disabled={isConnecting}
                  />
                  
                  {error && (
                    <div className="flex items-center gap-2 text-red-300 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      {error}
                    </div>
                  )}
                  
                  <button
                    onClick={handleMastodonConnect}
                    disabled={isConnecting || !mastodonInstance.trim()}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-gray-600/80 disabled:cursor-not-allowed text-white rounded text-sm transition-colors neon-glow"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-3 h-3" />
                        Connect to Mastodon
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Coming Soon Platforms */}
              <div className="space-y-2">
                {[
                  { name: 'X (Twitter)', icon: '𝕏' },
                  { name: 'Threads', icon: '📱' },
                  { name: 'BlueSky', icon: '🦋' }
                ].map((platform) => (
                  <div key={platform.name} className="flex items-center justify-between p-3 bg-black/40 rounded-lg opacity-60 border border-purple-400/10">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{platform.icon}</span>
                      <div>
                        <div className="font-medium text-purple-200 text-sm">{platform.name}</div>
                        <div className="text-xs text-purple-300/60">Coming soon</div>
                      </div>
                    </div>
                    <button
                      disabled
                      className="px-2 py-1 bg-gray-600/60 text-gray-400 rounded text-xs cursor-not-allowed"
                    >
                      Soon
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}