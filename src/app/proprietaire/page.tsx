import { OwnerDashboardContent } from '@/components/owner/OwnerDashboard'
import { TopNavbar } from '@/components/shared/Navigation'
import { getUserSession } from '@/lib/session'

export default async function ProprietairePage() {
  const user = await getUserSession();
  
  return (
    <>
      <TopNavbar user={user || undefined} />
      <OwnerDashboardContent />
    </>
  )
}
