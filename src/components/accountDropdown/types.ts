export interface AccountDropdownState {
  isOpen: boolean
  showMastodonConnect: boolean
  mastodonInstance: string
  showBlueSkyConnect: boolean
  blueSkyHandle: string
  isConnecting: boolean
  error: string
}

export interface AccountCardProps {
  platform: 'mastodon' | 'threads' | 'bluesky'
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