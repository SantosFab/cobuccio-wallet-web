import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const cardVariants = cva(
  'rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900',
  {
    variants: {
      padding: {
        default: 'p-4',
        sm: 'p-3',
      },
    },
    defaultVariants: {
      padding: 'default',
    },
  },
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding, ...props }, ref) => {
    return (
      <div className={cn(cardVariants({ padding, className }))} ref={ref} {...props} />
    )
  },
)
Card.displayName = 'Card'

export { Card, cardVariants }
