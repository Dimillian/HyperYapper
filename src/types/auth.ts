export interface MastodonSession {
  accessToken: string
  instance: string
  userId: string
  username: string
  displayName: string
  avatar?: string
  createdAt: number
  expiresAt?: number
}

export interface ThreadsSession {
  accessToken: string
  expiresIn: number
  tokenType: string
  userInfo: ThreadsUserInfo
  createdAt: number
}

export interface ThreadsUserInfo {
  id: string
  username: string
  name: string
  profilePictureUrl?: string
  biography?: string
}

export interface SessionStorage {
  mastodon?: MastodonSession
  twitter?: any // TODO: implement later
  threads?: ThreadsSession
  bluesky?: any // TODO: implement later
}

export interface MastodonApp {
  id: string
  name: string
  website: string
  redirect_uri: string
  client_id: string
  client_secret: string
  vapid_key: string
}

export interface MastodonAuthResponse {
  access_token: string
  token_type: string
  scope: string
  created_at: number
}

export interface MastodonAccount {
  id: string
  username: string
  display_name: string
  avatar: string
  acct: string
  url: string
}