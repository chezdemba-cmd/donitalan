import { DriverDashboardContent } from '@/components/driver/DriverDashboard'
import { TopNavbar } from '@/components/shared/Navigation'
import { getUserSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import type { TruckType } from '@/types'

export const dynamic = 'force-dynamic'

export default async function ChauffeurPage() {
  const user = await getUserSession();
  if (!user) {
    redirect('/connexion')
  }

  // Find owner profile
  const owner = await prisma.truckOwner.findUnique({
    where: { userId: user.id }
  });

  let dbBooking = null;

  if (owner) {
    // Find an active booking for this owner's trucks
    dbBooking = await prisma.booking.findFirst({
      where: {
        truck: { ownerId: owner.id },
        status: {
          in: ['PAYMENT_SECURED', 'IN_PROGRESS', 'COMPLETED_PENDING_VALIDATION']
        }
      },
      include: {
        truck: true,
        client: { include: { user: true } }
      },
      orderBy: { scheduledAt: 'asc' }
    });
  }

  const activeMission = dbBooking ? {
    id: dbBooking.id,
    number: dbBooking.bookingNumber,
    clientName: dbBooking.client ? `${dbBooking.client.user.firstName} ${dbBooking.client.user.lastName}` : 'Client Inconnu',
    clientPhone: dbBooking.client?.user.phone || '+22300000000',
    status: dbBooking.status,
    departure: dbBooking.departureAddress,
    arrival: dbBooking.arrivalAddress,
    truckInfo: `${dbBooking.truck.brand} ${dbBooking.truck.model} (${dbBooking.truck.licensePlate})`,
    scheduledAt: dbBooking.scheduledAt.toISOString()
  } : null;
  
  return (
    <>
      <TopNavbar user={user || undefined} />
      <DriverDashboardContent activeMission={activeMission as any} />
    </>
  )
}
