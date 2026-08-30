'use client'

import { useState, useRef } from 'react'
import { Upload, X, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react'
import { compressImage, validateImageFile, createPreviewURL, revokePreviewURL } from '@/utils/imageCompression'

interface ImageUploadProps {
  onImageChange: (file: File, previewUrl: string) => void
  currentImage?: string
  maxSizeMB?: number
  label?: string
  className?: string
}

export default function ImageUpload({
  onImageChange,
  currentImage,
  maxSizeMB = 5,
  label = 'Upload Gambar',
  className = ''
}: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null)
  const [compressing, setCompressing] = useState(false)
  const [error, setError] = useState('')
  const [compressionInfo, setCompressionInfo] = useState<{ original: number; compressed: number; ratio: number } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = validateImageFile(file, maxSizeMB)
    if (!validation.valid) {
      setError(validation.error || 'File tidak valid')
      return
    }

    setError('')
    setCompressing(true)
    setCompressionInfo(null)

    try {
      const result = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 0.8,
        maxSizeKB: 250
      })

      const url = createPreviewURL(result.blob)
      setPreviewUrl(url)
      setCompressionInfo({
        original: result.originalSize,
        compressed: result.compressedSize,
        ratio: result.compressionRatio
      })

      onImageChange(result.file, url)
    } catch (err) {
      setError('Gagal mengompres gambar. Silakan coba lagi.')
      console.error('Compression error:', err)
    } finally {
      setCompressing(false)
    }
  }

  const handleRemove = () => {
    if (previewUrl && previewUrl !== currentImage) {
      revokePreviewURL(previewUrl)
    }
    setPreviewUrl(null)
    setCompressionInfo(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-emerald-500 transition cursor-pointer relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={compressing}
        />
        
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-48 object-contain rounded-lg"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
              disabled={compressing}
            >
              <X className="w-4 h-4" />
            </button>
            {compressionInfo && (
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {formatFileSize(compressionInfo.compressed)} ({compressionInfo.ratio.toFixed(0)}%)
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            {compressing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mb-4"></div>
                <p className="text-sm text-slate-600">Mengompres gambar...</p>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-sm text-slate-600 mb-2">
                  Klik atau drag gambar ke sini
                </p>
                <p className="text-xs text-slate-500">
                  JPG, PNG, WebP, GIF (Maks {maxSizeMB}MB)
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {compressionInfo && compressionInfo.ratio > 0 && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>
            Tersimpan {formatFileSize(compressionInfo.compressed)} 
            ({compressionInfo.ratio.toFixed(0)}% kompresi)
          </span>
        </div>
      )}
    </div>
  )
}