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

  // Find driver profile
  const driver = await prisma.driver.findUnique({
    where: { userId: user.id }
  });

  let dbBooking = null;

  if (driver) {
    // Find an active booking for this driver's owner's trucks
    // In a real app, you would check if the booking is assigned to this driver specifically.
    // For MVP, we show the active mission of the fleet.
    dbBooking = await prisma.booking.findFirst({
      where: {
        truck: { ownerId: driver.ownerId },
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
