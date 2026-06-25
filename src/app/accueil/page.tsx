import { TopNavbar } from '@/components/shared/Navigation'
import { HomeContent } from '@/components/client/HomeContent'
import { getUserSession } from '@/lib/session'

export default async function AccueilPage() {
  const user = await getUserSession()

  return (
    <>
      <TopNavbar user={user || undefined} />
      <HomeContent />
    </>
  )
}
