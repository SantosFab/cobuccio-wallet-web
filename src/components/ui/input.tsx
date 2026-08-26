import * as React from 'react'

import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-neutral-300 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/40 disabled:cursor-not-allowed disabled:opacity-50 dark:border-neutral-700 dark:placeholder:text-neutral-500 aria-invalid:border-red-500 aria-invalid:focus-visible:ring-red-500/40',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
