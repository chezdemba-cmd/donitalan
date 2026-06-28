import { TopNavbar, BottomNav } from '@/components/shared/Navigation'
import { getUserSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { AddTruckForm } from '@/components/owner/AddTruckForm'

export const dynamic = 'force-dynamic'

export default async function AjouterCamionPage() {
  const user = await getUserSession();
  
  if (!user || user.role !== 'TRUCK_OWNER') {
    redirect('/connexion')
  }

  // Fetch active cities to display in the select dropdown
  const citiesDb = await prisma.city.findMany({
    where: { active: true },
    orderBy: { name: 'asc' }
  })

  const cities = citiesDb.map(c => ({ id: c.id, name: c.name }))

  return (
    <main className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <TopNavbar user={user || undefined} />
      
      <div className="container-app py-8 animate-fade-in">
        <AddTruckForm cities={cities} />
      </div>

      <BottomNav role="TRUCK_OWNER" />
    </main>
  )
}
