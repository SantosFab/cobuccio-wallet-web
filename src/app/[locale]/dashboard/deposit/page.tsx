'use client'

import { DepositForm } from '@/components/deposit-form'
import { useRouter } from '@/i18n/navigation'

export default function DashboardDepositPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4">
      <DepositForm onSuccess={() => router.push('/dashboard')} />
    </div>
  )
}
