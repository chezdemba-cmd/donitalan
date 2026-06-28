import { TopNavbar } from '@/components/shared/Navigation'
import { ReservationDetailContent } from '@/components/client/ReservationDetail'
import { getUserSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import type { TruckType } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ReservationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUserSession();
  
  if (!user) {
    redirect('/connexion')
  }

  const client = await prisma.client.findUnique({
    where: { userId: user.id }
  });

  if (!client) {
    notFound();
  }

  const dbBooking = await prisma.booking.findUnique({
    where: { 
      id,
      clientId: client.id
    },
    include: {
      truck: true,
      driver: { include: { user: true } }
    }
  });

  if (!dbBooking) {
    notFound();
  }

  const booking = {
    id: dbBooking.id,
    bookingNumber: dbBooking.bookingNumber,
    truck: { 
      brand: dbBooking.truck.brand, 
      model: dbBooking.truck.model, 
      truckType: dbBooking.truck.truckType as TruckType
    },
    serviceType: dbBooking.serviceType,
    status: dbBooking.status,
    departureAddress: dbBooking.departureAddress,
    arrivalAddress: dbBooking.arrivalAddress,
    scheduledAt: dbBooking.scheduledAt.toISOString(),
    totalPrice: Number(dbBooking.totalPrice),
    currency: dbBooking.currency,
    startOtp: dbBooking.startOtp,
    cargoDescription: dbBooking.cargoDescription,
    specialRequirements: dbBooking.specialRequirements,
    driver: dbBooking.driver ? {
      firstName: dbBooking.driver.user.firstName,
      lastName: dbBooking.driver.user.lastName,
      phone: dbBooking.driver.user.phone,
      avatarUrl: dbBooking.driver.user.avatarUrl
    } : null
  };
  
  return (
    <>
      <TopNavbar user={user || undefined} />
      <ReservationDetailContent booking={booking} />
    </>
  )
}
