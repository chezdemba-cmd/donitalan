import { TopNavbar } from '@/components/shared/Navigation'
import { PaymentPageContent } from '@/components/client/PaymentPage'
import { Suspense } from 'react'

export default function PaiementPage() {
  return (
    <>
      <TopNavbar />
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement...</div>}>
        <PaymentPageContent />
      </Suspense>
    </>
  )
}
