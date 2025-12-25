import { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

export interface FormFieldProps {
  label: string
  error?: string | null
  required?: boolean
  hint?: string
  children: ReactNode
}

export function FormField({
  label,
  error,
  required = false,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground/90">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div className="flex items-center gap-1.5 text-red-600 dark:text-red-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  )
}

export interface FormInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | null
}

export function FormInput({ error, className = '', ...props }: FormInputProps) {
  return (
    <input
      className={`w-full px-3 py-2 bg-background border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-colors ${
        error
          ? 'border-red-500 dark:border-red-600 focus:ring-red-500/20 dark:focus:ring-red-600/20'
          : 'border-input focus:ring-ring/20'
      } ${className}`}
      {...props}
    />
  )
}

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | null
}

export function FormTextarea({
  error,
  className = '',
  ...props
}: FormTextareaProps) {
  return (
    <textarea
      className={`w-full px-3 py-2 bg-background border rounded-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 transition-colors resize-none ${
        error
          ? 'border-red-500 dark:border-red-600 focus:ring-red-500/20 dark:focus:ring-red-600/20'
          : 'border-input focus:ring-ring/20'
      } ${className}`}
      {...props}
    />
  )
}

export interface FormErrorProps {
  message: string | null
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null

  return (
    <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-700 rounded-lg flex items-center gap-2">
      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-300 flex-shrink-0" />
      <p className="text-sm text-red-700 dark:text-red-200">{message}</p>
    </div>
  )
}

export interface FormSuccessProps {
  message: string | null
}

export function FormSuccess({ message }: FormSuccessProps) {
  if (!message) return null

  return (
    <div className="p-3 bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-2">
      <div className="w-4 h-4 rounded-full bg-green-600 dark:bg-green-300 flex-shrink-0" />
      <p className="text-sm text-green-700 dark:text-green-200">{message}</p>
    </div>
  )
}
