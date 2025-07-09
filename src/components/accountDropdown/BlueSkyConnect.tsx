import { AlertCircle, ExternalLink, X } from 'lucide-react'

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
    <div className="p-3 bg-black/40 rounded-lg border border-purple-400/20 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-purple-100">Connect Bluesky</h4>
        <button
          onClick={onCancel}
          className="text-purple-300 hover:text-purple-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <input
        type="text"
        value={handle}
        onChange={(e) => onHandleChange(e.target.value)}
        placeholder="alice.bsky.social"
        className="w-full px-3 py-2 bg-black/60 border border-purple-400/30 rounded text-purple-100 placeholder-purple-300/50 text-sm focus:border-purple-300/60 focus:outline-none focus:shadow-[0_0_15px_rgba(168,85,247,0.3)]"
        disabled={isConnecting}
      />
      
      {error && (
        <div className="flex items-center gap-2 text-red-300 text-xs">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
      
      <button
        onClick={onConnect}
        disabled={isConnecting || !handle.trim()}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-500 hover:bg-purple-400 disabled:bg-gray-600/80 disabled:cursor-not-allowed text-white rounded text-sm transition-colors neon-glow"
      >
        {isConnecting ? (
          <>
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <ExternalLink className="w-3 h-3" />
            Connect to Bluesky
          </>
        )}
      </button>
    </div>
  )
}