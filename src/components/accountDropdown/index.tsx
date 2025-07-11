'use client'

import { useState, useEffect, useRef } from 'react'
import { MastodonAuth } from '@/lib/auth/mastodon'
import { ThreadsAuth } from '@/lib/auth/threads'
import { BlueSkyAuth } from '@/lib/auth/bluesky'
import { SessionManager } from '@/lib/storage/sessionStorage'
import { MastodonSession, ThreadsSession, BlueSkySession } from '@/types/auth'
import { User, ChevronDown } from 'lucide-react'
import { AccountCard } from './AccountCard'
import { MastodonConnect } from './MastodonConnect'
import { BlueSkyConnect } from './BlueSkyConnect'
import { AccountDropdownState } from './types'

export function AccountDropdown() {
  const [state, setState] = useState<AccountDropdownState>({
    isOpen: false,
    showMastodonConnect: false,
    mastodonInstance: '',
    showBlueSkyConnect: false,
    blueSkyHandle: '',
    isConnecting: false,
    error: ''
  })
  
  const [mastodonSession, setMastodonSession] = useState<MastodonSession | null>(null)
  const [threadsSession, setThreadsSession] = useState<ThreadsSession | null>(null)
  const [blueSkySession, setBlueSkySession] = useState<BlueSkySession | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load existing sessions
    const refreshSessions = () => {
      const sessionManager = SessionManager.getInstance()
      const mastodonSession = sessionManager.getMastodonSession()
      const threadsSession = sessionManager.getThreadsSession()
      const blueSkySession = sessionManager.getBlueSkySession()
      setMastodonSession(mastodonSession)
      setThreadsSession(threadsSession)
      setBlueSkySession(blueSkySession)
    }

    refreshSessions()

    // Listen for session changes
    const handleSessionChange = () => {
      refreshSessions()
    }

    window.addEventListener('sessionChanged', handleSessionChange)
    return () => window.removeEventListener('sessionChanged', handleSessionChange)
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setState(prev => ({ ...prev, isOpen: false, showMastodonConnect: false, showBlueSkyConnect: false }))
      }
    }

    // Open dropdown when requested from other components
    const handleOpenDropdown = () => {
      setState(prev => ({ ...prev, isOpen: true }))
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('openAccountDropdown', handleOpenDropdown)
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('openAccountDropdown', handleOpenDropdown)
    }
  }, [])

  const handleMastodonConnect = async () => {
    if (!state.mastodonInstance.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter a Mastodon instance' }))
      return
    }

    setState(prev => ({ ...prev, isConnecting: true, error: '' }))

    try {
      const app = await MastodonAuth.registerApp(state.mastodonInstance)
      
      sessionStorage.setItem('mastodon_app_data', JSON.stringify({
        instance: state.mastodonInstance,
        clientId: app.client_id,
        clientSecret: app.client_secret
      }))

      const authUrl = MastodonAuth.generateAuthUrl(state.mastodonInstance, app.client_id)
      window.location.href = authUrl

    } catch (err) {
      console.error('Failed to initiate Mastodon auth:', err)
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Failed to connect to Mastodon',
        isConnecting: false 
      }))
    }
  }

  const handleMastodonLogout = () => {
    MastodonAuth.logout()
    setMastodonSession(null)
    setState(prev => ({ ...prev, isOpen: false }))
    window.dispatchEvent(new CustomEvent('sessionChanged'))
  }

  const handleThreadsConnect = async () => {
    try {
      const authUrl = ThreadsAuth.generateAuthUrl()
      window.location.href = authUrl
    } catch (err) {
      console.error('Failed to initiate Threads auth:', err)
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Failed to connect to Threads'
      }))
    }
  }

  const handleThreadsLogout = () => {
    const sessionManager = SessionManager.getInstance()
    sessionManager.removeThreadsSession()
    setThreadsSession(null)
    setState(prev => ({ ...prev, isOpen: false }))
    window.dispatchEvent(new CustomEvent('sessionChanged'))
  }

  const handleBlueSkyConnect = async () => {
    if (!state.blueSkyHandle.trim()) {
      setState(prev => ({ ...prev, error: 'Please enter your Bluesky handle' }))
      return
    }

    setState(prev => ({ ...prev, isConnecting: true, error: '' }))

    try {
      // Only run on client-side
      if (typeof window === 'undefined') {
        throw new Error('Bluesky authentication requires a browser environment')
      }

      const authUrl = await BlueSkyAuth.initiateLogin(state.blueSkyHandle)
      window.location.href = authUrl
    } catch (err) {
      console.error('Failed to initiate Bluesky auth:', err)
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err.message : 'Failed to connect to Bluesky',
        isConnecting: false 
      }))
    }
  }

  const handleBlueSkyLogout = () => {
    const sessionManager = SessionManager.getInstance()
    sessionManager.removeBlueSkySession()
    setBlueSkySession(null)
    setState(prev => ({ ...prev, isOpen: false }))
    window.dispatchEvent(new CustomEvent('sessionChanged'))
  }

  const connectedCount = (mastodonSession ? 1 : 0) + (threadsSession ? 1 : 0) + (blueSkySession ? 1 : 0)

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setState(prev => ({ ...prev, isOpen: !prev.isOpen }))}
        className="flex items-center gap-2 px-3 py-2 bg-purple-500/30 hover:bg-purple-500/40 border border-purple-300/50 rounded-lg transition-all duration-200 neon-glow hover:neon-glow-strong"
      >
        {mastodonSession?.avatar ? (
          <img 
            src={mastodonSession.avatar} 
            alt={mastodonSession.displayName}
            className="w-6 h-6 rounded-full border border-purple-300/40"
          />
        ) : threadsSession?.userInfo.profilePictureUrl ? (
          <img 
            src={threadsSession.userInfo.profilePictureUrl} 
            alt={threadsSession.userInfo.name}
            className="w-6 h-6 rounded-full border border-purple-300/40"
          />
        ) : (
          <User className="w-5 h-5 text-purple-300" />
        )}
        <span className="text-sm text-purple-100 font-medium">
          {connectedCount > 0 ? `${connectedCount} connected` : 'Connect accounts'}
        </span>
        <ChevronDown className={`w-4 h-4 text-purple-300 transition-transform ${state.isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {state.isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-black/90 backdrop-blur-xl border border-purple-300/40 rounded-lg shadow-xl z-50 bright-glow">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-purple-100 mb-3 glow-text">Account Management</h3>
            
            <div className="space-y-3">
              {/* Mastodon Account */}
              <AccountCard
                platform="mastodon"
                isConnected={!!mastodonSession}
                session={mastodonSession}
                onConnect={() => setState(prev => ({ ...prev, showMastodonConnect: !prev.showMastodonConnect }))}
                onDisconnect={handleMastodonLogout}
              />

              {/* Mastodon Connect Form */}
              {state.showMastodonConnect && !mastodonSession && (
                <MastodonConnect
                  instance={state.mastodonInstance}
                  onInstanceChange={(instance) => setState(prev => ({ ...prev, mastodonInstance: instance }))}
                  onConnect={handleMastodonConnect}
                  onCancel={() => setState(prev => ({ ...prev, showMastodonConnect: false }))}
                  isConnecting={state.isConnecting}
                  error={state.error}
                />
              )}

              {/* Threads Account */}
              <AccountCard
                platform="threads"
                isConnected={!!threadsSession}
                session={threadsSession}
                onConnect={handleThreadsConnect}
                onDisconnect={handleThreadsLogout}
              />

              {/* Bluesky Account */}
              <AccountCard
                platform="bluesky"
                isConnected={!!blueSkySession}
                session={blueSkySession}
                onConnect={() => setState(prev => ({ ...prev, showBlueSkyConnect: !prev.showBlueSkyConnect }))}
                onDisconnect={handleBlueSkyLogout}
              />

              {/* Bluesky Connect Form */}
              {state.showBlueSkyConnect && !blueSkySession && (
                <BlueSkyConnect
                  handle={state.blueSkyHandle}
                  onHandleChange={(handle) => setState(prev => ({ ...prev, blueSkyHandle: handle }))}
                  onConnect={handleBlueSkyConnect}
                  onCancel={() => setState(prev => ({ ...prev, showBlueSkyConnect: false }))}
                  isConnecting={state.isConnecting}
                  error={state.error}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}