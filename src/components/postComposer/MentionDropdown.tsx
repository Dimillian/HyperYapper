import { useState, useEffect, useMemo } from 'react'
import { MastodonPoster } from '@/lib/posting/mastodon'
import { BlueSkyPoster } from '@/lib/posting/bluesky'
import { MastodonSession, BlueSkySession } from '@/types/auth'
import { SiMastodon, SiBluesky } from 'react-icons/si'

interface MastodonAccount {
  id: string
  username: string
  acct: string
  display_name: string
  avatar: string
  avatar_static: string
}

interface BlueSkyAccount {
  did: string
  handle: string
  displayName: string
  avatar?: string
  description?: string
}

type Account = MastodonAccount | BlueSkyAccount

interface MentionDropdownProps {
  isVisible: boolean
  query: string
  position: { top: number; left: number }
  mastodonSession: MastodonSession | null
  blueSkySession: BlueSkySession | null
  platform?: 'mastodon' | 'bluesky' | null
  allowMultiPlatform?: boolean
  onSelect: (account: Account, platform: 'mastodon' | 'bluesky') => void
  onClose: () => void
}

export function MentionDropdown({ 
  isVisible, 
  query, 
  position, 
  mastodonSession, 
  blueSkySession,
  platform,
  allowMultiPlatform = false,
  onSelect, 
  onClose 
}: MentionDropdownProps) {
  const [mastodonAccounts, setMastodonAccounts] = useState<MastodonAccount[]>([])
  const [blueSkyAccounts, setBlueSkyAccounts] = useState<BlueSkyAccount[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoadingMastodon, setIsLoadingMastodon] = useState(false)
  const [isLoadingBlueSky, setIsLoadingBlueSky] = useState(false)
  const [activeTab, setActiveTab] = useState<'mastodon' | 'bluesky'>('mastodon')

  // Determine which platforms are available
  const hasMastodon = !!mastodonSession
  const hasBlueSky = !!blueSkySession
  const connectedPlatforms = useMemo(() => [
    ...(hasMastodon ? ['mastodon' as const] : []),
    ...(hasBlueSky ? ['bluesky' as const] : [])
  ], [hasMastodon, hasBlueSky])

  // Set initial active tab based on available platforms
  useEffect(() => {
    if (connectedPlatforms.length > 0 && !connectedPlatforms.includes(activeTab)) {
      setActiveTab(connectedPlatforms[0])
    }
  }, [activeTab, connectedPlatforms])

  // Search accounts on all platforms or specific platform
  useEffect(() => {
    if (!isVisible || query.length < 2) {
      setMastodonAccounts([])
      setBlueSkyAccounts([])
      return
    }

    const searchAccounts = async () => {
      // In single platform mode, only search the specified platform
      if (!allowMultiPlatform && platform) {
        if (platform === 'mastodon' && mastodonSession) {
          setIsLoadingMastodon(true)
          try {
            const results = await MastodonPoster.searchAccounts(mastodonSession, query)
            setMastodonAccounts(results)
            setSelectedIndex(0)
          } catch (error) {
            console.error('Failed to search Mastodon accounts:', error)
            setMastodonAccounts([])
          } finally {
            setIsLoadingMastodon(false)
          }
        } else if (platform === 'bluesky' && blueSkySession) {
          setIsLoadingBlueSky(true)
          try {
            const results = await BlueSkyPoster.searchAccounts(blueSkySession, query)
            setBlueSkyAccounts(results)
            setSelectedIndex(0)
          } catch (error) {
            console.error('Failed to search BlueSky accounts:', error)
            setBlueSkyAccounts([])
          } finally {
            setIsLoadingBlueSky(false)
          }
        }
        return
      }

      // In multi-platform mode, search all connected platforms
      if (mastodonSession) {
        setIsLoadingMastodon(true)
        MastodonPoster.searchAccounts(mastodonSession, query)
          .then(results => {
            setMastodonAccounts(results)
            setSelectedIndex(0)
          })
          .catch(error => {
            console.error('Failed to search Mastodon accounts:', error)
            setMastodonAccounts([])
          })
          .finally(() => setIsLoadingMastodon(false))
      }

      if (blueSkySession) {
        setIsLoadingBlueSky(true)
        BlueSkyPoster.searchAccounts(blueSkySession, query)
          .then(results => {
            setBlueSkyAccounts(results)
            setSelectedIndex(0)
          })
          .catch(error => {
            console.error('Failed to search BlueSky accounts:', error)
            setBlueSkyAccounts([])
          })
          .finally(() => setIsLoadingBlueSky(false))
      }
    }

    // Debounce search
    const timer = setTimeout(searchAccounts, 300)
    return () => clearTimeout(timer)
  }, [isVisible, query, mastodonSession, blueSkySession, platform, allowMultiPlatform])

  // Get current tab's accounts
  const currentAccounts = activeTab === 'mastodon' ? mastodonAccounts : blueSkyAccounts
  const isLoading = activeTab === 'mastodon' ? isLoadingMastodon : isLoadingBlueSky
  const showTabs = allowMultiPlatform && connectedPlatforms.length > 1

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return

      switch (e.key) {
        case 'Tab':
          if (showTabs) {
            e.preventDefault()
            const currentIndex = connectedPlatforms.indexOf(activeTab)
            const nextIndex = e.shiftKey 
              ? (currentIndex - 1 + connectedPlatforms.length) % connectedPlatforms.length
              : (currentIndex + 1) % connectedPlatforms.length
            setActiveTab(connectedPlatforms[nextIndex])
            setSelectedIndex(0)
          }
          break
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, currentAccounts.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (currentAccounts[selectedIndex]) {
            onSelect(currentAccounts[selectedIndex], activeTab)
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, currentAccounts, selectedIndex, activeTab, showTabs, connectedPlatforms, onSelect, onClose])

  // In single platform mode, hide if no accounts
  if (!isVisible || (!allowMultiPlatform && !isLoading && currentAccounts.length === 0)) {
    return null
  }

  // In multi-platform mode, hide if no connected platforms
  if (!isVisible || (allowMultiPlatform && connectedPlatforms.length === 0)) {
    return null
  }

  return (
    <div 
      className="absolute bg-black/90 backdrop-blur-sm border border-purple-400/40 rounded-lg shadow-xl z-50 w-64 overflow-hidden"
      style={{ top: position.top, left: position.left }}
    >
      {/* Tabs Header */}
      {showTabs && (
        <div className="flex border-b border-purple-400/20">
          {hasMastodon && (
            <button
              onClick={() => setActiveTab('mastodon')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'mastodon' 
                  ? 'text-purple-100 bg-purple-500/20 border-b-2 border-purple-400' 
                  : 'text-purple-300/70 hover:text-purple-100'
              }`}
            >
              <SiMastodon className="w-4 h-4" />
              Mastodon
            </button>
          )}
          {hasBlueSky && (
            <button
              onClick={() => setActiveTab('bluesky')}
              className={`flex-1 px-3 py-2 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'bluesky' 
                  ? 'text-purple-100 bg-purple-500/20 border-b-2 border-purple-400' 
                  : 'text-purple-300/70 hover:text-purple-100'
              }`}
            >
              <SiBluesky className="w-4 h-4" />
              Bluesky
            </button>
          )}
        </div>
      )}

      {/* Search Results */}
      <div className="max-h-48 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 text-center text-purple-300/60">
            <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-2"></div>
            Searching...
          </div>
        ) : currentAccounts.length === 0 ? (
          <div className="p-3 text-center text-purple-300/60 text-sm">
            {query.length < 2 ? 'Type at least 2 characters' : 'No users found'}
          </div>
        ) : (
          <div className="py-2">
            {currentAccounts.map((account, index) => {
              const isMastodon = 'acct' in account
              const displayName = isMastodon ? account.display_name || account.username : account.displayName
              const handle = isMastodon ? account.acct : account.handle
              const avatar = isMastodon ? account.avatar_static : account.avatar
              const accountKey = isMastodon ? account.id : account.did
              
              return (
                <button
                  key={accountKey}
                  onClick={() => onSelect(account, activeTab)}
                  className={`w-full px-3 py-2 text-left hover:bg-purple-500/20 transition-colors duration-150 flex items-center gap-3 ${
                    index === selectedIndex ? 'bg-purple-500/20' : ''
                  }`}
                >
                  {avatar && (
                    <img 
                      src={avatar} 
                      alt={displayName}
                      className="w-8 h-8 rounded-full border border-purple-300/30"
                    />
                  )}
                  {!avatar && (
                    <div className="w-8 h-8 rounded-full border border-purple-300/30 bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-300 text-sm font-medium">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-purple-100 font-medium truncate">
                      {displayName}
                    </div>
                    <div className="text-purple-300/60 text-sm truncate">
                      @{handle}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Keyboard Hints */}
      {showTabs && currentAccounts.length > 0 && (
        <div className="px-3 py-2 border-t border-purple-400/20 text-xs text-purple-300/60 flex justify-between">
          <span>Tab: Switch platform</span>
          <span>↑↓ Enter: Select</span>
        </div>
      )}
    </div>
  )
}