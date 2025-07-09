import { Loader2 } from 'lucide-react'

interface BlueSkyConnectProps {
  handle: string
  onHandleChange: (handle: string) => void
  onConnect: () => void
  onCancel: () => void
  isConnecting: boolean
  error: string
}

export function BlueSkyConnect({
  handle,
  onHandleChange,
  onConnect,
  onCancel,
  isConnecting,
  error
}: BlueSkyConnectProps) {
  return (
    <div className="p-3 bg-purple-500/20 rounded-lg border border-purple-300/30">
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Enter your BlueSky handle (e.g., alice.bsky.social)"
          value={handle}
          onChange={(e) => onHandleChange(e.target.value)}
          className="w-full px-3 py-2 bg-black/50 border border-purple-300/40 rounded-md text-purple-100 placeholder-purple-300/50 focus:outline-none focus:border-purple-300 transition-colors cyberpunk-input"
          disabled={isConnecting}
        />
        
        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
        
        <div className="flex gap-2">
          <button
            onClick={onConnect}
            disabled={isConnecting || !handle.trim()}
            className="flex-1 px-3 py-1.5 bg-purple-500/40 hover:bg-purple-500/60 disabled:bg-purple-500/20 disabled:cursor-not-allowed border border-purple-300/50 rounded-md text-sm text-purple-100 transition-all duration-200 hover:neon-glow disabled:opacity-50"
          >
            {isConnecting ? (
              <Loader2 className="w-4 h-4 animate-spin mx-auto" />
            ) : (
              'Connect'
            )}
          </button>
          
          <button
            onClick={onCancel}
            disabled={isConnecting}
            className="px-3 py-1.5 bg-black/50 hover:bg-black/70 border border-purple-300/30 rounded-md text-sm text-purple-100 transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}