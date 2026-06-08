import * as React from 'react'
import { cn } from '@/lib/cn'

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'subtle'
type Size = 'default' | 'sm' | 'lg' | 'xl' | 'icon' | 'iconSm'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-[1.5px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'

const variants: Record<Variant, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'border border-border bg-card text-foreground hover:bg-surface-hover hover:border-border-strong',
  outline: 'border border-border bg-transparent text-foreground hover:bg-surface-hover',
  ghost: 'text-foreground hover:bg-surface-hover',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  subtle: 'bg-muted text-foreground hover:bg-accent',
}

const sizes: Record<Size, string> = {
  default: 'h-9 px-3.5 text-sm',
  sm: 'h-8 px-3 text-[13px] rounded-md',
  lg: 'h-10 px-5 text-sm',
  xl: 'h-11 px-6 text-[15px]',
  icon: 'h-9 w-9',
  iconSm: 'h-8 w-8 rounded-md',
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => (
    <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />
  ),
)
Button.displayName = 'Button'
