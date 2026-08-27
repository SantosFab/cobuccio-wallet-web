import { ChangePasswordForm } from '@/components/change-password-form'
import { ProfileForm } from '@/components/profile-form'

export default function DashboardProfilePage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <ProfileForm />
      <ChangePasswordForm />
    </div>
  )
}
