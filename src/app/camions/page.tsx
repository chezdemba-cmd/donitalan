import { TopNavbar } from '@/components/shared/Navigation'
import { TrucksSearchPage } from '@/components/client/TrucksSearch'
import { Suspense } from 'react'
import { getUserSession } from '@/lib/session'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function CamionsPage() {
  const user = await getUserSession();
  
  // Fetch real trucks from the DB
  const dbTrucks = await prisma.truck.findMany({
    where: { status: 'VALIDATED' },
    include: {
      city: true,
      owner: { include: { user: true } }
    },
    orderBy: { averageRating: 'desc' }
  });

  // Serialize and simplify for the client component
  const initialTrucks = dbTrucks.map(t => ({
    id: t.id,
    brand: t.brand,
    model: t.model,
    year: t.year,
    truckType: t.truckType,
    capacityTons: Number(t.capacityTons),
    volumeM3: t.volumeM3 ? Number(t.volumeM3) : null,
    basePrice: Number(t.basePrice),
    pricePerKm: t.pricePerKm ? Number(t.pricePerKm) : null,
    currency: t.currency,
    withDriver: t.withDriver,
    averageRating: Number(t.averageRating),
    totalTrips: t.totalTrips,
    city: { name: t.city.name },
    zones: t.zones,
    description: t.description || '',
    owner: {
      user: {
        firstName: t.owner.user.firstName,
        lastName: t.owner.user.lastName
      }
    }
  }));
  
  return (
    <>
      <TopNavbar user={user || undefined} />
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Chargement des camions...</div>}>
        <TrucksSearchPage initialTrucks={initialTrucks} />
      </Suspense>
    </>
  )
}
