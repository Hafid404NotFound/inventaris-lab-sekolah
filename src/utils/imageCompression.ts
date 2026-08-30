/**
 * Image compression utility for client-side image optimization
 * Converts images to WebP format with maximum 250KB size
 */

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  maxSizeKB?: number
}

export interface CompressionResult {
  blob: Blob
  file: File
  originalSize: number
  compressedSize: number
  compressionRatio: number
}

/**
 * Compress an image file to WebP format
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise with compressed blob and metadata
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    maxSizeKB = 250
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      reject(new Error('Canvas context not available'))
      return
    }

    img.onload = () => {
      // Calculate dimensions while maintaining aspect ratio
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      canvas.width = width
      canvas.height = height

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height)

      // Convert to WebP blob
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to compress image'))
            return
          }

          // Check if still too large, reduce quality
          if (blob.size > maxSizeKB * 1024) {
            const reducedQuality = quality * 0.8
            canvas.toBlob(
              (reducedBlob) => {
                if (reducedBlob && reducedBlob.size <= maxSizeKB * 1024) {
                  const compressedFile = new File([reducedBlob], file.name.replace(/\.[^/.]+$/, '.webp'), {
                    type: 'image/webp',
                    lastModified: Date.now()
                  })

                  resolve({
                    blob: reducedBlob,
                    file: compressedFile,
                    originalSize: file.size,
                    compressedSize: reducedBlob.size,
                    compressionRatio: ((file.size - reducedBlob.size) / file.size) * 100
                  })
                } else {
                  // Still too large, return original
                  resolve({
                    blob: blob,
                    file: file,
                    originalSize: file.size,
                    compressedSize: blob.size,
                    compressionRatio: 0
                  })
                }
              },
              'image/webp',
              reducedQuality
            )
          } else {
            const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now()
            })

            resolve({
              blob,
              file: compressedFile,
              originalSize: file.size,
              compressedSize: blob.size,
              compressionRatio: ((file.size - blob.size) / file.size) * 100
            })
          }
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    // Load image from file
    const reader = new FileReader()
    reader.onload = (e) => {
      img.src = e.target?.result as string
    }
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Create a preview URL for a compressed image
 * @param blob - The compressed image blob
 * @returns Object URL for preview
 */
export function createPreviewURL(blob: Blob): string {
  return URL.createObjectURL(blob)
}

/**
 * Revoke a preview URL to free memory
 * @param url - The preview URL to revoke
 */
export function revokePreviewURL(url: string): void {
  URL.revokeObjectURL(url)
}

/**
 * Validate image file type and size
 * @param file - The file to validate
 * @param maxSizeMB - Maximum size in MB (default: 5MB)
 * @returns Validation result
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Format file tidak didukung. Gunakan JPG, PNG, WebP, atau GIF.' }
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { valid: false, error: `Ukuran file terlalu besar. Maksimum ${maxSizeMB}MB.` }
  }
  
  return { valid: true }
}