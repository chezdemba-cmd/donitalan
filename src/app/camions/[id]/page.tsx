import { TopNavbar } from '@/components/shared/Navigation'
import { TruckDetailPage } from '@/components/client/TruckDetail'
import { getUserSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function TruckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserSession();
  
  const dbTruck = await prisma.truck.findUnique({
    where: { id },
    include: {
      city: { include: { country: true } },
      owner: { include: { user: true } },
      documents: true,
      reviews: { include: { author: true } }
    }
  });

  if (!dbTruck) {
    notFound();
  }

  // Serialize the data for Client Component
  const initialTruck = {
    id: dbTruck.id,
    brand: dbTruck.brand,
    model: dbTruck.model,
    year: dbTruck.year,
    licensePlate: dbTruck.licensePlate,
    truckType: dbTruck.truckType,
    capacityTons: Number(dbTruck.capacityTons),
    volumeM3: dbTruck.volumeM3 ? Number(dbTruck.volumeM3) : null,
    basePrice: Number(dbTruck.basePrice),
    pricePerKm: dbTruck.pricePerKm ? Number(dbTruck.pricePerKm) : null,
    pricePerHour: dbTruck.pricePerHour ? Number(dbTruck.pricePerHour) : null,
    currency: dbTruck.currency,
    withDriver: dbTruck.withDriver,
    photoUrls: dbTruck.photoUrls,
    averageRating: Number(dbTruck.averageRating),
    totalTrips: dbTruck.totalTrips,
    city: { 
      name: dbTruck.city.name,
      country: { name: dbTruck.city.country.name, flag: dbTruck.city.country.flag }
    },
    zones: dbTruck.zones,
    description: dbTruck.description || '',
    owner: {
      id: dbTruck.owner.id,
      user: {
        firstName: dbTruck.owner.user.firstName,
        lastName: dbTruck.owner.user.lastName,
        phone: dbTruck.owner.user.phone,
        avatarUrl: dbTruck.owner.user.avatarUrl
      },
      kycStatus: dbTruck.owner.kycStatus,
      totalEarnings: Number(dbTruck.owner.totalEarnings)
    },
    documents: dbTruck.documents.map(d => ({
      docType: d.docType,
      verified: d.verified
    })),
    reviews: dbTruck.reviews.map(r => ({
      id: r.id,
      rating: Number(r.rating),
      comment: r.comment || '',
      createdAt: r.createdAt.toISOString(),
      author: {
        firstName: r.author.firstName,
        lastName: r.author.lastName,
        avatarUrl: r.author.avatarUrl
      }
    }))
  };

  return (
    <>
      <TopNavbar user={user || undefined} />
      <TruckDetailPage initialTruck={initialTruck} />
    </>
  )
}
