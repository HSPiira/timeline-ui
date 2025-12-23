import { useState, useRef } from 'react'
import { Upload, X, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { timelineApi } from '@/lib/api-client'

export interface EventDocumentUploadProps {
  subjectId: string
  onDocumentsAdded: (documentIds: string[]) => void
  onError?: (error: string) => void
  required?: boolean
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
  documentId?: string
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

export function EventDocumentUpload({
  subjectId,
  onDocumentsAdded,
  onError,
  required = false,
}: EventDocumentUploadProps) {
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [documentType, setDocumentType] = useState('evidence')
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

      const formData = new FormData()
      formData.append('file', file)
      formData.append('subject_id', subjectId)
      formData.append('document_type', documentType)

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
        const errorMessage =
          typeof error === 'object' && 'message' in error
            ? (error as any).message
            : typeof error === 'object' && 'detail' in error
              ? (error as any).detail
              : 'Upload failed'

        setFiles((prev) => prev.map((f) => (f.id === uploadingFile.id ? { ...f, status: 'error', error: errorMessage, progress: 0 } : f)))
        onError?.(errorMessage)
      } else if (data) {
        setFiles((prev) => prev.map((f) => (f.id === uploadingFile.id ? { ...f, status: 'success', progress: 100, documentId: data.id } : f)))
        // Notify parent of successful upload
        const successfulDocs = files.filter((f) => f.status === 'success' || f.id === uploadingFile.id).map((f) => f.documentId || data.id).filter(Boolean) as string[]
        if (successfulDocs.length > 0) {
          onDocumentsAdded(successfulDocs)
        }
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

  const successCount = files.filter((f) => f.status === 'success').length

  return (
    <div className="space-y-2.5">
      {/* Document Type Selector */}
      <div>
        <label className="block text-xs font-medium text-foreground/90 mb-1">
          Document Type {required && <span className="text-red-500">*</span>}
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full px-2.5 py-1.5 bg-background border border-input rounded-sm text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="evidence">Evidence</option>
          <option value="invoice">Invoice</option>
          <option value="contract">Contract</option>
          <option value="receipt">Receipt</option>
          <option value="certificate">Certificate</option>
          <option value="report">Report</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-sm p-5 text-center transition-colors ${
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

        <div className="space-y-2">
          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
          <div>
            <p className="font-medium text-foreground text-sm">Drag and drop files here</p>
            <p className="text-xs text-muted-foreground">or click to select files</p>
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
        <div className="space-y-1.5">
          {files.map((uploadingFile) => (
            <div key={uploadingFile.id} className="flex items-center gap-2.5 p-2.5 bg-card rounded-sm border border-border/50">
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {uploadingFile.status === 'uploading' && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                {uploadingFile.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {uploadingFile.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{uploadingFile.file.name}</p>
                <p className="text-xs text-muted-foreground">{(uploadingFile.file.size / 1024 / 1024).toFixed(2)}MB</p>

                {/* Progress Bar */}
                {uploadingFile.status === 'uploading' && (
                  <div className="mt-1 w-full bg-background rounded-full h-0.5 overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadingFile.progress}%` }} />
                  </div>
                )}

                {/* Error Message */}
                {uploadingFile.status === 'error' && uploadingFile.error && (
                  <p className="text-xs text-red-500 mt-0.5">{uploadingFile.error}</p>
                )}
              </div>

              {/* Remove Button */}
              {uploadingFile.status !== 'uploading' && (
                <button
                  onClick={() => removeFile(uploadingFile.id)}
                  className="flex-shrink-0 p-1 hover:bg-muted rounded-sm transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              )}
            </div>
          ))}

          {/* Status Summary */}
          {successCount > 0 && (
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              {successCount} document{successCount !== 1 ? 's' : ''} uploaded
            </p>
          )}
        </div>
      )}
    </div>
  )
}
