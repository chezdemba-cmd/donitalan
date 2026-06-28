import { OwnerDashboardContent } from '@/components/owner/OwnerDashboard'
import { TopNavbar } from '@/components/shared/Navigation'
import { getUserSession } from '@/lib/session'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProprietairePage() {
  const user = await getUserSession();
  if (!user || user.role !== 'TRUCK_OWNER') {
    redirect('/connexion');
  }

  const owner = await prisma.truckOwner.findUnique({
    where: { userId: user.id },
    include: {
      user: true,
      trucks: true,
      payouts: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!owner) {
    redirect('/connexion');
  }

  // Get all bookings related to the owner's trucks
  const truckIds = owner.trucks.map(t => t.id);
  const bookings = await prisma.booking.findMany({
    where: { truckId: { in: truckIds } },
    include: {
      client: { include: { user: true } },
      truck: true,
      payment: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Calculate Stats
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  let thisMonthRevenue = 0;
  let totalRevenue = 0;
  
  owner.payouts.forEach(payout => {
    if (payout.status === 'COMPLETED' || payout.status === 'PENDING') {
      const amount = Number(payout.amount);
      totalRevenue += amount;
      if (payout.createdAt >= startOfMonth) {
        thisMonthRevenue += amount;
      }
    }
  });

  const missionsThisMonth = bookings.filter(b => b.status === 'COMPLETED' && b.createdAt >= startOfMonth).length;
  
  let totalRating = 0;
  let ratingCount = 0;
  owner.trucks.forEach(t => {
    if (Number(t.averageRating) > 0) {
      totalRating += Number(t.averageRating);
      ratingCount++;
    }
  });
  const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 'N/A';
  const activeTrucks = owner.trucks.filter(t => t.status === 'VALIDATED').length;

  const stats = {
    thisMonthRevenue,
    totalRevenue,
    missionsThisMonth,
    avgRating,
    activeTrucks
  };

  // Prepare data for Client Component
  const ownerData = {
    id: owner.id,
    firstName: owner.user.firstName,
    lastName: owner.user.lastName,
    stats,
    trucks: owner.trucks.map(t => ({
      id: t.id,
      brand: t.brand,
      model: t.model,
      year: t.year,
      truckType: t.truckType,
      status: t.status,
      averageRating: Number(t.averageRating),
      totalTrips: t.totalTrips,
      basePrice: Number(t.basePrice)
    })),
    bookings: bookings.map(b => ({
      id: b.id,
      number: b.bookingNumber,
      client: b.client ? `${b.client.user.firstName} ${b.client.user.lastName}` : 'Client Inconnu',
      phone: b.client?.user.phone || '',
      departure: b.departureCity || b.departureAddress,
      arrival: b.arrivalCity || b.arrivalAddress,
      scheduledAt: b.scheduledAt.toISOString(),
      amount: b.payment ? Number(b.payment.ownerAmount) : 0,
      status: b.status,
      createdAt: b.createdAt.toISOString()
    })),
    payouts: owner.payouts.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      processedAt: p.processedAt ? p.processedAt.toISOString() : null
    }))
  };
  
  return (
    <>
      <TopNavbar user={user || undefined} />
      <OwnerDashboardContent initialData={ownerData as any} />
    </>
  )
}
