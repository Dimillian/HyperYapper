import { SessionStorage, MastodonSession, ThreadsSession } from '@/types/auth'

const STORAGE_KEY = 'hyperyapper_sessions'

export class SessionManager {
  private static instance: SessionManager
  private sessions: SessionStorage = {}

  private constructor() {
    this.loadSessions()
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  private loadSessions(): void {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.sessions = JSON.parse(stored)
        // Validate sessions and remove expired ones
        this.validateSessions()
      }
    } catch (error) {
      console.error('Failed to load sessions:', error)
      this.sessions = {}
    }
  }

  private saveSessions(): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions))
    } catch (error) {
      console.error('Failed to save sessions:', error)
    }
  }

  private validateSessions(): void {
    const now = Date.now()
    let hasChanges = false

    // Check Mastodon session
    if (this.sessions.mastodon) {
      const session = this.sessions.mastodon
      if (session.expiresAt && session.expiresAt < now) {
        delete this.sessions.mastodon
        hasChanges = true
      }
    }

    // Check Threads session
    if (this.sessions.threads) {
      const session = this.sessions.threads
      const expiresAt = session.createdAt + (session.expiresIn * 1000)
      if (expiresAt < now) {
        delete this.sessions.threads
        hasChanges = true
      }
    }

    if (hasChanges) {
      this.saveSessions()
    }
  }

  // Mastodon session methods
  setMastodonSession(session: MastodonSession): void {
    this.sessions.mastodon = session
    this.saveSessions()
  }

  getMastodonSession(): MastodonSession | null {
    return this.sessions.mastodon || null
  }

  removeMastodonSession(): void {
    delete this.sessions.mastodon
    this.saveSessions()
  }

  // Threads session methods
  setThreadsSession(session: ThreadsSession): void {
    this.sessions.threads = session
    this.saveSessions()
  }

  getThreadsSession(): ThreadsSession | null {
    return this.sessions.threads || null
  }

  removeThreadsSession(): void {
    delete this.sessions.threads
    this.saveSessions()
  }

  // General methods
  getAllSessions(): SessionStorage {
    return { ...this.sessions }
  }

  getConnectedPlatforms(): string[] {
    const platforms: string[] = []
    if (this.sessions.mastodon) platforms.push('mastodon')
    if (this.sessions.twitter) platforms.push('twitter')
    if (this.sessions.threads) platforms.push('threads')
    if (this.sessions.bluesky) platforms.push('bluesky')
    return platforms
  }

  clearAllSessions(): void {
    this.sessions = {}
    this.saveSessions()
  }

  isSessionValid(platform: string): boolean {
    const now = Date.now()
    
    switch (platform) {
      case 'mastodon':
        const mastodonSession = this.sessions.mastodon
        if (!mastodonSession) return false
        return !mastodonSession.expiresAt || mastodonSession.expiresAt > now
      
      case 'threads':
        const threadsSession = this.sessions.threads
        if (!threadsSession) return false
        const expiresAt = threadsSession.createdAt + (threadsSession.expiresIn * 1000)
        return expiresAt > now
      
      default:
        return false
    }
  }
}