import { TopNavbar } from '@/components/shared/Navigation'
import { PaymentPageContent } from '@/components/client/PaymentPage'
import { Suspense } from 'react'
import { getUserSession } from '@/lib/session'

export default async function PaiementPage() {
  const user = await getUserSession();
  
  return (
    <>
      <TopNavbar user={user || undefined} />
      <div className="container mx-auto p-4 md:p-8">
        <Suspense fallback={<div>Chargement du paiement...</div>}>
          <PaymentPageContent />
        </Suspense>
      </div>
    </>
  )
}
