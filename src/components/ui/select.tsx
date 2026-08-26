import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const selectVariants = cva(
  'h-10 rounded-md border px-3 py-2 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold/40 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-neutral-300 bg-transparent text-foreground focus-visible:border-gold dark:border-neutral-700 aria-invalid:border-red-500 aria-invalid:focus-visible:ring-red-500/40',
        header:
          'border-white/25 bg-white/5 text-white focus-visible:border-white/60 [&>option]:text-neutral-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <select
        className={cn(selectVariants({ variant, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Select.displayName = 'Select'

export { Select, selectVariants }
