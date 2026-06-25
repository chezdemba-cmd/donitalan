import { TopNavbar } from '@/components/shared/Navigation'
import { TrucksSearchPage } from '@/components/client/TrucksSearch'
import { Suspense } from 'react'
import { getUserSession } from '@/lib/session'

export default async function CamionsPage() {
  const user = await getUserSession();
  
  return (
    <>
      <TopNavbar user={user || undefined} />
      <Suspense fallback={<div>Chargement...</div>}>
        <TrucksSearchPage />
      </Suspense>
    </>
  )
}
