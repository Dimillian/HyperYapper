interface EmojiStorage {
  recentEmojis: string[]
  lastUpdated: number
}

const STORAGE_KEY = 'hyperyapper_recent_emojis'
const MAX_RECENT_EMOJIS = 24

export class EmojiStorageManager {
  private static instance: EmojiStorageManager
  
  static getInstance(): EmojiStorageManager {
    if (!EmojiStorageManager.instance) {
      EmojiStorageManager.instance = new EmojiStorageManager()
    }
    return EmojiStorageManager.instance
  }

  private getStorage(): EmojiStorage {
    if (typeof window === 'undefined') {
      return { recentEmojis: [], lastUpdated: 0 }
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as EmojiStorage
        // Validate the data structure
        if (Array.isArray(parsed.recentEmojis) && typeof parsed.lastUpdated === 'number') {
          return parsed
        }
      }
    } catch (error) {
      console.error('Failed to parse recent emojis from localStorage:', error)
    }

    return { recentEmojis: [], lastUpdated: 0 }
  }

  private saveStorage(data: EmojiStorage): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save recent emojis to localStorage:', error)
    }
  }

  getRecentEmojis(): string[] {
    return this.getStorage().recentEmojis
  }

  addRecentEmoji(emoji: string): void {
    const storage = this.getStorage()
    
    // Remove the emoji if it already exists (to move it to the front)
    const filteredEmojis = storage.recentEmojis.filter(e => e !== emoji)
    
    // Add the new emoji to the front
    const updatedEmojis = [emoji, ...filteredEmojis]
    
    // Limit to MAX_RECENT_EMOJIS
    const recentEmojis = updatedEmojis.slice(0, MAX_RECENT_EMOJIS)
    
    const updatedStorage: EmojiStorage = {
      recentEmojis,
      lastUpdated: Date.now()
    }
    
    this.saveStorage(updatedStorage)
  }

  clearRecentEmojis(): void {
    const updatedStorage: EmojiStorage = {
      recentEmojis: [],
      lastUpdated: Date.now()
    }
    
    this.saveStorage(updatedStorage)
  }

  hasRecentEmojis(): boolean {
    return this.getRecentEmojis().length > 0
  }

  getRecentEmojisCount(): number {
    return this.getRecentEmojis().length
  }
}