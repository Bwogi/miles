/**
 * Image compression and optimization utilities
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'jpeg' | 'webp'
}

/**
 * Compress an image from a canvas element
 */
export function compressImage(
  canvas: HTMLCanvasElement,
  options: CompressionOptions = {}
): string {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.6,
    format = 'jpeg'
  } = options

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas context not available')

  // Get original dimensions
  const originalWidth = canvas.width
  const originalHeight = canvas.height
  const aspectRatio = originalWidth / originalHeight

  // Calculate target dimensions
  let targetWidth = originalWidth
  let targetHeight = originalHeight

  if (originalWidth > maxWidth || originalHeight > maxHeight) {
    if (aspectRatio > 1) {
      // Landscape
      targetWidth = Math.min(maxWidth, originalWidth)
      targetHeight = targetWidth / aspectRatio
    } else {
      // Portrait
      targetHeight = Math.min(maxHeight, originalHeight)
      targetWidth = targetHeight * aspectRatio
    }
  }

  // Create new canvas for compression
  const compressedCanvas = document.createElement('canvas')
  const compressedContext = compressedCanvas.getContext('2d')
  
  if (!compressedContext) throw new Error('Compressed canvas context not available')

  compressedCanvas.width = targetWidth
  compressedCanvas.height = targetHeight

  // Apply image smoothing for better quality
  compressedContext.imageSmoothingEnabled = true
  compressedContext.imageSmoothingQuality = 'high'

  // Draw compressed image
  compressedContext.drawImage(canvas, 0, 0, targetWidth, targetHeight)

  // Convert to data URL with compression
  const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg'
  return compressedCanvas.toDataURL(mimeType, quality)
}

/**
 * Get estimated file size of base64 image
 */
export function getImageSize(base64String: string): number {
  // Remove data URL prefix
  const base64Data = base64String.split(',')[1] || base64String
  
  // Calculate size in bytes (base64 is ~33% larger than binary)
  const sizeInBytes = (base64Data.length * 3) / 4
  
  // Account for padding
  const padding = base64Data.endsWith('==') ? 2 : base64Data.endsWith('=') ? 1 : 0
  
  return sizeInBytes - padding
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * Validate image quality and suggest compression if needed
 */
export function validateImageSize(base64String: string, maxSizeKB: number = 500): {
  isValid: boolean
  currentSize: number
  formattedSize: string
  suggestion?: string
} {
  const currentSize = getImageSize(base64String)
  const maxSizeBytes = maxSizeKB * 1024
  
  return {
    isValid: currentSize <= maxSizeBytes,
    currentSize,
    formattedSize: formatFileSize(currentSize),
    suggestion: currentSize > maxSizeBytes 
      ? `Image size (${formatFileSize(currentSize)}) exceeds ${maxSizeKB}KB limit. Consider reducing quality or dimensions.`
      : undefined
  }
}
