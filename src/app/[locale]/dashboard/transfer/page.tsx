'use client'

import { TransferForm } from '@/components/transfer-form'
import { useRouter } from '@/i18n/navigation'

export default function DashboardTransferPage() {
  const router = useRouter()

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <TransferForm onSuccess={() => router.push('/dashboard')} />
    </div>
  )
}
