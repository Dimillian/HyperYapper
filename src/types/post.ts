export interface PostContent {
  text: string
  platforms: string[]
  images?: File[]
}

export interface PostResult {
  platform: string
  success: boolean
  error?: string
  postId?: string
  postUrl?: string
}

export interface PostStatus {
  isPosting: boolean
  results: PostResult[]
  errors: string[]
}

export interface MastodonPostResponse {
  id: string
  url: string
  content: string
  created_at: string
}