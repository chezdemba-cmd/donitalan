import { TopNavbar } from '@/components/shared/Navigation'
import { ReservationsContent } from '@/components/client/Reservations'
import { getUserSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ReservationsPage() {
  const user = await getUserSession();
  
  if (!user) {
    redirect('/connexion')
  }

  const client = await prisma.client.findUnique({
    where: { userId: user.id }
  });

  const dbBookings = client ? await prisma.booking.findMany({
    where: { clientId: client.id },
    include: {
      truck: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  }) : [];

  const initialBookings = dbBookings.map(b => ({
    id: b.id,
    bookingNumber: b.bookingNumber,
    truck: { brand: b.truck.brand, model: b.truck.model, truckType: b.truck.truckType },
    serviceType: b.serviceType,
    status: b.status,
    departureAddress: b.departureAddress,
    arrivalAddress: b.arrivalAddress,
    scheduledAt: b.scheduledAt.toISOString(),
    totalPrice: Number(b.totalPrice),
    currency: b.currency,
    startOtp: b.startOtp
  }));
  
  return (
    <>
      <TopNavbar user={user || undefined} />
      <ReservationsContent initialBookings={initialBookings} />
    </>
  )
}
