import { useState, useEffect } from 'react'
import { MastodonPoster } from '@/lib/posting/mastodon'
import { MastodonSession } from '@/types/auth'

interface MastodonAccount {
  id: string
  username: string
  acct: string
  display_name: string
  avatar: string
  avatar_static: string
}

interface MentionDropdownProps {
  isVisible: boolean
  query: string
  position: { top: number; left: number }
  mastodonSession: MastodonSession | null
  onSelect: (account: MastodonAccount) => void
  onClose: () => void
}

export function MentionDropdown({ 
  isVisible, 
  query, 
  position, 
  mastodonSession, 
  onSelect, 
  onClose 
}: MentionDropdownProps) {
  const [accounts, setAccounts] = useState<MastodonAccount[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!isVisible || !mastodonSession || query.length < 2) {
      setAccounts([])
      return
    }

    const searchAccounts = async () => {
      setIsLoading(true)
      try {
        const results = await MastodonPoster.searchAccounts(mastodonSession, query)
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
  }, [isVisible, query, mastodonSession])

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
          {accounts.map((account, index) => (
            <button
              key={account.id}
              onClick={() => onSelect(account)}
              className={`w-full px-3 py-2 text-left hover:bg-purple-500/20 transition-colors duration-150 flex items-center gap-3 ${
                index === selectedIndex ? 'bg-purple-500/20' : ''
              }`}
            >
              <img 
                src={account.avatar_static} 
                alt={account.display_name}
                className="w-8 h-8 rounded-full border border-purple-300/30"
              />
              <div className="flex-1 min-w-0">
                <div className="text-purple-100 font-medium truncate">
                  {account.display_name || account.username}
                </div>
                <div className="text-purple-300/60 text-sm truncate">
                  @{account.acct}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}