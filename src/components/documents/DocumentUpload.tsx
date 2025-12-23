import { useState, useRef } from 'react'
import { Upload, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { timelineApi } from '@/lib/api-client'

export interface DocumentUploadProps {
  subjectId?: string
  eventId?: string
  onUploadComplete?: (documentId: string) => void
  onError?: (error: string) => void
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

export function DocumentUpload({
  subjectId,
  eventId,
  onUploadComplete,
  onError,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `File type not supported: ${file.type}`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File size exceeds 100MB: ${(file.size / 1024 / 1024).toFixed(2)}MB`
    }
    return null
  }

  const uploadFile = async (file: File, uploadingFile: UploadingFile) => {
    try {
      setFiles((prev) => prev.map((f) => (f.id === uploadingFile.id ? { ...f, status: 'uploading' } : f)))

      // Create FormData for multipart upload
      const formData = new FormData()
      formData.append('file', file)
      if (subjectId) formData.append('subject_id', subjectId)
      if (eventId) formData.append('event_id', eventId)

      // Mock progress updates (real implementation would use XMLHttpRequest for progress)
      const progressInterval = setInterval(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadingFile.id && f.progress < 90 ? { ...f, progress: f.progress + Math.random() * 30 } : f
          )
        )
      }, 300)

      const { data, error } = await timelineApi.documents.upload(formData as any)

      clearInterval(progressInterval)

      if (error) {
        const errorMessage = typeof error === 'object' && 'message' in error ? (error as any).message : 'Upload failed'
        setFiles((prev) => prev.map((f) => (f.id === uploadingFile.id ? { ...f, status: 'error', error: errorMessage, progress: 0 } : f)))
        onError?.(errorMessage)
      } else if (data) {
        setFiles((prev) => prev.map((f) => (f.id === uploadingFile.id ? { ...f, status: 'success', progress: 100 } : f)))
        onUploadComplete?.(data.id)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unexpected error during upload'
      setFiles((prev) => prev.map((f) => (f.id === uploadingFile.id ? { ...f, status: 'error', error: errorMessage, progress: 0 } : f)))
      onError?.(errorMessage)
    }
  }

  const handleFiles = (fileList: FileList) => {
    const newFiles: UploadingFile[] = []

    Array.from(fileList).forEach((file) => {
      const error = validateFile(file)

      if (error) {
        onError?.(error)
        return
      }

      const uploadingFile: UploadingFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'uploading',
      }

      newFiles.push(uploadingFile)
      uploadFile(file, uploadingFile)
    })

    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== 'success'))
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-sm p-8 text-center transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleInputChange}
          className="hidden"
          accept={ALLOWED_TYPES.join(',')}
        />

        <div className="space-y-3">
          <Upload className="w-10 h-10 mx-auto text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground">Drag and drop files here</p>
            <p className="text-sm text-muted-foreground">or click to select files</p>
          </div>
          <p className="text-xs text-muted-foreground">Max 100MB per file. Supported: PDF, images, Word, Excel</p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute inset-0 opacity-0"
          aria-label="Upload files"
        />
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((uploadingFile) => (
            <div key={uploadingFile.id} className="flex items-center gap-3 p-3 bg-card rounded-sm border border-border/50">
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {uploadingFile.status === 'uploading' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                {uploadingFile.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {uploadingFile.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{uploadingFile.file.name}</p>
                <p className="text-xs text-muted-foreground">{(uploadingFile.file.size / 1024 / 1024).toFixed(2)}MB</p>

                {/* Progress Bar */}
                {uploadingFile.status === 'uploading' && (
                  <div className="mt-2 w-full bg-background rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadingFile.progress}%` }}
                    />
                  </div>
                )}

                {/* Error Message */}
                {uploadingFile.status === 'error' && uploadingFile.error && (
                  <p className="text-xs text-red-500 mt-1">{uploadingFile.error}</p>
                )}
              </div>

              {/* Remove Button */}
              {uploadingFile.status !== 'uploading' && (
                <button
                  onClick={() => removeFile(uploadingFile.id)}
                  className="flex-shrink-0 p-1 hover:bg-muted rounded-sm transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
          ))}

          {/* Clear Completed */}
          {files.some((f) => f.status === 'success') && (
            <button onClick={clearCompleted} className="text-xs text-muted-foreground hover:text-foreground">
              Clear completed
            </button>
          )}
        </div>
      )}
    </div>
  )
}
