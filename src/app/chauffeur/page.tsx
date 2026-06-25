import { DriverDashboardContent } from '@/components/driver/DriverDashboard'
import { TopNavbar } from '@/components/shared/Navigation'
import { getUserSession } from '@/lib/session'

export default async function ChauffeurPage() {
  const user = await getUserSession();
  
  return (
    <>
      <TopNavbar user={user || undefined} />
      <DriverDashboardContent />
    </>
  )
}
