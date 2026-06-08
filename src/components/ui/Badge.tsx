import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'primary' | 'success' | 'warning' | 'destructive'

const variants: Record<BadgeVariant, string> = {
  default: 'border-border bg-card text-foreground',
  secondary: 'border-transparent bg-muted text-foreground',
  outline: 'border-border text-muted-foreground bg-transparent',
  primary: 'border-primary/40 bg-primary/10 text-primary',
  success: 'border-success/40 bg-success/10 text-success',
  warning: 'border-warning/40 bg-warning/10 text-warning',
  destructive: 'border-destructive/40 bg-destructive/10 text-destructive',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-tight',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
