import { CheckCircle, AlertCircle } from 'lucide-react'
import { PostStatus } from '@/types/post'

interface PostResultsProps {
  postStatus: PostStatus | null
}

export function PostResults({ postStatus }: PostResultsProps) {
  if (!postStatus) return null

  return (
    <div className="mt-4 space-y-3">
      {postStatus.results.map((result, index) => (
        <div 
          key={index}
          className={`p-3 rounded-lg border ${
            result.success 
              ? 'bg-green-900/20 border-green-500/30' 
              : 'bg-red-900/20 border-red-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {result.success ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span className="text-sm font-medium text-purple-100 capitalize">
              {result.platform}
            </span>
            {result.success ? (
              <span className="text-sm text-green-300">Posted successfully!</span>
            ) : (
              <span className="text-sm text-red-300">Failed to post</span>
            )}
          </div>
          {result.error && (
            <div className="mt-1 text-xs text-red-300">{result.error}</div>
          )}
          {result.postUrl && (
            <div className="mt-1">
              <a 
                href={result.postUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-purple-300 hover:text-purple-200 underline"
              >
                View post →
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}