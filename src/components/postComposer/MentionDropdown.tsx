import { useState, useEffect } from 'react'
import { MastodonPoster } from '@/lib/posting/mastodon'
import { BlueSkyPoster } from '@/lib/posting/bluesky'
import { MastodonSession, BlueSkySession } from '@/types/auth'

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
  platform: 'mastodon' | 'bluesky'
  onSelect: (account: Account) => void
  onClose: () => void
}

export function MentionDropdown({ 
  isVisible, 
  query, 
  position, 
  mastodonSession, 
  blueSkySession,
  platform,
  onSelect, 
  onClose 
}: MentionDropdownProps) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const session = platform === 'mastodon' ? mastodonSession : blueSkySession
    if (!isVisible || !session || query.length < 2) {
      setAccounts([])
      return
    }

    const searchAccounts = async () => {
      setIsLoading(true)
      try {
        let results: Account[] = []
        if (platform === 'mastodon' && mastodonSession) {
          results = await MastodonPoster.searchAccounts(mastodonSession, query)
        } else if (platform === 'bluesky' && blueSkySession) {
          results = await BlueSkyPoster.searchAccounts(blueSkySession, query)
        }
        setAccounts(results)
        setSelectedIndex(0)
      } catch (error) {
        console.error('Failed to search accounts:', error)
        setAccounts([])
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timer = setTimeout(searchAccounts, 300)
    return () => clearTimeout(timer)
  }, [isVisible, query, mastodonSession, blueSkySession, platform])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || accounts.length === 0) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(prev => Math.min(prev + 1, accounts.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(prev => Math.max(prev - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (accounts[selectedIndex]) {
            onSelect(accounts[selectedIndex])
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
  }, [isVisible, accounts, selectedIndex, onSelect, onClose])

  if (!isVisible || (!isLoading && accounts.length === 0)) {
    return null
  }

  return (
    <div 
      className="absolute bg-black/90 backdrop-blur-sm border border-purple-400/40 rounded-lg shadow-xl z-50 w-64 max-h-48 overflow-y-auto"
      style={{ top: position.top, left: position.left }}
    >
      {isLoading ? (
        <div className="p-3 text-center text-purple-300/60">
          <div className="animate-spin w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-2"></div>
          Searching...
        </div>
      ) : (
        <div className="py-2">
          {accounts.map((account, index) => {
            const isMastodon = 'acct' in account
            const displayName = isMastodon ? account.display_name || account.username : account.displayName
            const handle = isMastodon ? account.acct : account.handle
            const avatar = isMastodon ? account.avatar_static : account.avatar
            const accountKey = isMastodon ? account.id : account.did
            
            return (
              <button
                key={accountKey}
                onClick={() => onSelect(account)}
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
  )
}