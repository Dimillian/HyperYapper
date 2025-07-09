import { X } from 'lucide-react'
import { AttachedImage } from './types'

interface ImagePreviewProps {
  images: AttachedImage[]
  onRemove: (imageId: string) => void
}

export function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  if (images.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {images.map(image => (
        <div key={image.id} className="relative group">
          <img 
            src={image.preview} 
            alt="Attached"
            className="w-24 h-24 object-cover rounded-lg border border-purple-400/40"
          />
          <button
            onClick={() => onRemove(image.id)}
            className="absolute top-1 right-1 p-1 bg-black/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-500/80"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      ))}
    </div>
  )
}