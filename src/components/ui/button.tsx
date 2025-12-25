import { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary/30 active:bg-primary/80',
  secondary:
    'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary/30 active:bg-secondary/80',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive/30 active:bg-destructive/80',
  outline:
    'border border-input bg-background text-foreground hover:bg-muted/30 focus:ring-ring/30 active:bg-muted/50',
  ghost:
    'text-foreground hover:bg-muted/50 focus:ring-ring/20 active:bg-muted/70',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-2.5 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-medium rounded-xs transition-colors'
  const focusStyles =
    'focus:outline-none focus:ring-2 focus:ring-offset-0'
  const disabledStyles =
    'disabled:opacity-50 disabled:cursor-not-allowed'

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${focusStyles} ${disabledStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export type ButtonIconProps = ButtonProps & {
  icon?: ReactNode
}

export function ButtonIcon({
  icon,
  children,
  ...props
}: ButtonIconProps) {
  return (
    <Button {...props}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children && <span>{children}</span>}
    </Button>
  )
}
