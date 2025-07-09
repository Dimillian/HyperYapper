import { Upload } from 'lucide-react'

interface DragDropOverlayProps {
  isDragging: boolean
}

export function DragDropOverlay({ isDragging }: DragDropOverlayProps) {
  if (!isDragging) return null

  return (
    <div className="absolute inset-0 bg-purple-500/20 rounded-lg z-10 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        <Upload className="w-12 h-12 text-purple-300 mx-auto mb-2" />
        <p className="text-purple-100 font-medium">Drop images here</p>
      </div>
    </div>
  )
}