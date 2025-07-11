export interface Platform {
  id: string
  name: string
  limit: number
  brandColor: string
  glowColor: string
}

export const PLATFORMS: Platform[] = [
  {
    id: 'threads',
    name: 'Threads',
    limit: 500,
    brandColor: '#ffffff',
    glowColor: 'rgba(255, 255, 255, 0.6)'
  },
  {
    id: 'mastodon',
    name: 'Mastodon',
    limit: 500,
    brandColor: '#595AFF',
    glowColor: 'rgba(89, 90, 255, 0.6)'
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    limit: 300,
    brandColor: '#00A8E8',
    glowColor: 'rgba(0, 168, 232, 0.6)'
  }
]