'use client'

import { useTranslations } from 'next-intl'

import { ProfileForm } from '@/components/profile-form'

export default function DashboardProfilePage() {
  const translate = useTranslations('DashboardPage')

  return (
    <div className="flex flex-col gap-4">
      <h1 className="border-l-2 border-gold pl-2 text-xl font-semibold">
        {translate('sections.profile')}
      </h1>
      <ProfileForm />
    </div>
  )
}
