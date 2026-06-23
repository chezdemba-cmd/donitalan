'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  block?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      block = false,
      leftIcon,
      rightIcon,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: 'btn-primary',
      accent: 'btn-accent',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
      danger: 'btn-danger',
      success: 'btn-success',
    }

    const sizeClasses = {
      sm: 'btn-sm',
      md: '',
      lg: 'btn-lg',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'btn',
          variantClasses[variant],
          sizeClasses[size],
          block && 'btn-block',
          (loading || disabled) && 'opacity-60 cursor-not-allowed',
          className
        )}
        disabled={loading || disabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'
