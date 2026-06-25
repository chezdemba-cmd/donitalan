import { TopNavbar } from '@/components/shared/Navigation'
import { ReservationsContent } from '@/components/client/Reservations'
import { getUserSession } from '@/lib/session'

export default async function ReservationsPage() {
  const user = await getUserSession();
  
  return (
    <>
      <TopNavbar user={user || undefined} />
      <ReservationsContent />
    </>
  )
}
