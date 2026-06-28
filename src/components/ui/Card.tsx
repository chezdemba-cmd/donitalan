'use client'

import React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ interactive = false, padding = 'md', className, children, ...props }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-slate-100 shadow-card',
        interactive && 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover',
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

interface BadgeProps {
  variant?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'muted'
  children: React.ReactNode
  className?: string
  dot?: boolean
}

export function Badge({ variant = 'primary', children, className, dot }: BadgeProps) {
  const variantClass = `badge-${variant}`
  return (
    <span className={cn('badge', variantClass, className)}>
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full', {
            'bg-primary': variant === 'primary',
            'bg-accent': variant === 'accent',
            'bg-success': variant === 'success',
            'bg-warning': variant === 'warning',
            'bg-danger': variant === 'danger',
            'bg-muted': variant === 'muted',
          })}
        />
      )}
      {children}
    </span>
  )
}

// Stat Card
interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: { value: number; label: string }
  color?: string
  className?: string
}

export function StatCard({ label, value, icon, trend, color = 'text-primary', className }: StatCardProps) {
  return (
    <Card className={cn('stat-card', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className={cn('stat-value mt-1', color)}>{value}</p>
        </div>
        {icon && (
          <div className="p-3 rounded-2xl bg-slate-50 text-muted">
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className={cn('mt-2 text-sm font-medium flex items-center gap-1',
          trend.value >= 0 ? 'text-success' : 'text-danger'
        )}>
          <span>{trend.value >= 0 ? '↑' : '↓'}</span>
          <span>{Math.abs(trend.value)}%</span>
          <span className="text-muted font-normal">{trend.label}</span>
        </div>
      )}
    </Card>
  )
}

// Empty State
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4 text-center', className)}>
      {icon && (
        <div className="mb-4 text-slate-300 text-6xl">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text mb-2">{title}</h3>
      {description && <p className="text-muted max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}

// Divider
export function Divider({ className }: { className?: string }) {
  return <hr className={cn('border-t border-slate-100 my-6', className)} />
}

// Avatar
interface AvatarProps {
  src?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : '?'

  return (
    <div className={cn(
      'rounded-full flex items-center justify-center font-bold overflow-hidden flex-shrink-0',
      sizeClasses[size],
      !src && 'bg-primary text-white',
      className
    )}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  )
}

// Loading Spinner
export function Spinner({ size = 'md', className }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className={cn('border-2 border-slate-200 border-t-primary rounded-full animate-spin', sizeClasses[size])} />
    </div>
  )
}

// Modal
interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open || !mounted) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] bg-black/60 overflow-y-auto overscroll-y-contain animate-fade-in"
      role="dialog"
      aria-modal="true"
      onMouseDown={handleBackdropClick}
    >
      <div 
        className="min-h-full flex items-center justify-center p-4 py-8 sm:p-6"
        onMouseDown={handleBackdropClick}
      >
        <div className={cn(
          'relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full animate-slide-up flex flex-col',
          sizeClasses[size]
        )}>
          {title && (
            <div className="sticky top-0 z-20 bg-white flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 rounded-t-2xl sm:rounded-t-3xl shadow-sm">
              <h2 className="text-lg font-bold text-text">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                className="p-2 -mr-2 rounded-xl hover:bg-slate-100 text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
          )}
          <div className="p-5 sm:p-6 relative z-10">{children}</div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

// Rating Stars
interface RatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (value: number) => void
}

export function Rating({ value, max = 5, size = 'md', interactive = false, onChange }: RatingProps) {
  const sizeClasses = { sm: 'text-sm', md: 'text-xl', lg: 'text-3xl' }
  
  return (
    <div className={cn('flex gap-0.5', sizeClasses[size])}>
      {Array.from({ length: max }, (_, i) => i + 1).map(star => (
        <span
          key={star}
          className={cn(
            interactive && 'cursor-pointer hover:scale-110 transition-transform',
            star <= value ? 'text-warning' : 'text-slate-200'
          )}
          onClick={() => interactive && onChange && onChange(star)}
          role={interactive ? 'button' : undefined}
        >
          ★
        </span>
      ))}
    </div>
  )
}

// Progress Bar
interface ProgressProps {
  value: number
  max?: number
  color?: string
  className?: string
  label?: string
}

export function Progress({ value, max = 100, color = 'bg-accent', className, label }: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100))
  
  return (
    <div className={className}>
      {label && <p className="text-sm text-muted mb-1">{label}</p>}
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
