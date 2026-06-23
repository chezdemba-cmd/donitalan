import { TopNavbar } from '@/components/shared/Navigation'
import { TruckDetailPage } from '@/components/client/TruckDetail'

export default function TruckPage({ params }: { params: { id: string } }) {
  return (
    <>
      <TopNavbar />
      <TruckDetailPage truckId={params.id} />
    </>
  )
}
