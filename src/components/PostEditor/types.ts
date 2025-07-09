export interface AttachedImage {
  id: string
  file: File
  preview: string
}

export const PLATFORM_LIMITS = {
  twitter: 280,
  threads: 500,
  mastodon: 500,
  bluesky: 300
} as const