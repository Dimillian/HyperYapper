import { useState, useCallback } from 'react'
import { AttachedImage } from './types'

export function useImageHandler() {
  const [attachedImages, setAttachedImages] = useState<AttachedImage[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const processImageFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    )

    imageFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const newImage: AttachedImage = {
          id: Math.random().toString(36).substring(7),
          file,
          preview: e.target?.result as string
        }
        setAttachedImages(prev => [...prev, newImage])
      }
      reader.readAsDataURL(file)
    })
  }, [])

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFiles(e.target.files)
    }
  }, [processImageFiles])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    const imageItems = Array.from(items).filter(item => 
      item.type.startsWith('image/')
    )

    if (imageItems.length > 0) {
      e.preventDefault()
      const files = imageItems.map(item => item.getAsFile()).filter(Boolean) as File[]
      processImageFiles(files)
    }
  }, [processImageFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      setIsDragging(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(e.dataTransfer.files)
    }
  }, [processImageFiles])

  const removeImage = useCallback((imageId: string) => {
    setAttachedImages(prev => prev.filter(img => img.id !== imageId))
  }, [])

  const clearImages = useCallback(() => {
    setAttachedImages([])
  }, [])

  return {
    attachedImages,
    isDragging,
    handleImageSelect,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    removeImage,
    clearImages
  }
}