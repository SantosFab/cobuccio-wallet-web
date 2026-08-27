'use client'

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastViewport,
} from '@/components/ui/toast'
import { removeToast, useToasts } from '@/lib/toast-store'

export function Toaster() {
  const toasts = useToasts()

  return (
    <ToastProvider duration={5000}>
      {toasts.map((entry) => (
        <Toast
          key={entry.id}
          variant={entry.variant}
          onOpenChange={(open) => {
            if (!open) removeToast(entry.id)
          }}
        >
          <ToastDescription>{entry.message}</ToastDescription>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
