import { TopNavbar } from '@/components/shared/Navigation'
import { TruckDetailPage } from '@/components/client/TruckDetail'
import { getUserSession } from '@/lib/session'

export default async function TruckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserSession();
  
  return (
    <>
      <TopNavbar user={user || undefined} />
      <TruckDetailPage truckId={id} />
    </>
  )
}
