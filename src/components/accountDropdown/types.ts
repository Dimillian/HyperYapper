export interface AccountDropdownState {
  isOpen: boolean
  showMastodonConnect: boolean
  mastodonInstance: string
  isConnecting: boolean
  error: string
}

export interface AccountCardProps {
  platform: 'mastodon' | 'threads' | 'x' | 'bluesky'
  isConnected: boolean
  session?: any
  onConnect: () => void
  onDisconnect: () => void
}

export interface MastodonConnectProps {
  instance: string
  onInstanceChange: (instance: string) => void
  onConnect: () => void
  onCancel: () => void
  isConnecting: boolean
  error: string
}