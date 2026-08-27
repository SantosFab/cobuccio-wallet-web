import { useSyncExternalStore } from 'react'

export interface ToastEntry {
  id: string
  variant: 'error' | 'success'
  message: string
}

// Module-scope store (not a React Context) — this is what lets `toast.error(...)`
// be called from any catch block, without needing to be inside a Provider or
// have the function threaded down through props.
let toasts: ToastEntry[] = []
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return toasts
}

function getServerSnapshot(): ToastEntry[] {
  return []
}

function addToast(variant: ToastEntry['variant'], message: string) {
  toasts = [...toasts, { id: crypto.randomUUID(), variant, message }]
  emit()
}

export function removeToast(id: string) {
  toasts = toasts.filter((entry) => entry.id !== id)
  emit()
}

export const toast = {
  error: (message: string) => addToast('error', message),
  success: (message: string) => addToast('success', message),
}

export function useToasts(): ToastEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
