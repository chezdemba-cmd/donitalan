import { AdminDashboardContent, AdminDashboardProps } from '@/components/admin/AdminDashboard'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  // Fetch stats concurrently for performance
  const [
    totalUsers,
    activeTrucks,
    activeBookings,
    revenueData,
    pendingTrucksDb,
    recentBookingsDb,
    openDisputesDb
  ] = await Promise.all([
    prisma.user.count(),
    prisma.truck.count({ where: { status: 'VALIDATED' } }),
    prisma.booking.count({ where: { status: { in: ['IN_PROGRESS', 'PAYMENT_SECURED', 'DRIVER_ASSIGNED'] } } }),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: 'SECURED' } // Simplified for MVP: total secured payments
    }),
    prisma.truck.findMany({
      where: { status: 'PENDING_VALIDATION' },
      include: { owner: { include: { user: true } }, city: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.booking.findMany({
      include: { client: { include: { user: true } }, truck: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    }),
    prisma.dispute.findMany({
      where: { status: 'OPEN' },
      include: { client: { include: { user: true } }, booking: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ])

  // Format data for the client component
  const dashboardData: AdminDashboardProps = {
    stats: {
      totalUsers,
      activeTrucks,
      activeBookings,
      monthlyRevenue: Number(revenueData._sum.amount || 0)
    },
    pendingTrucks: pendingTrucksDb.map(t => ({
      id: t.id,
      brand: t.brand,
      model: t.model,
      owner: t.owner.user.firstName + ' ' + t.owner.user.lastName,
      city: t.city.name,
      submittedAt: t.createdAt.toISOString()
    })),
    recentBookings: recentBookingsDb.map(b => ({
      id: b.id,
      number: b.bookingNumber,
      client: b.client ? b.client.user.firstName + ' ' + b.client.user.lastName : 'Client inconnu',
      truck: b.truck.brand + ' ' + b.truck.model,
      amount: Number(b.totalPrice),
      status: b.status
    })),
    openDisputes: openDisputesDb.map(d => ({
      id: d.id,
      bookingNumber: d.booking.bookingNumber,
      client: d.client ? d.client.user.firstName + ' ' + d.client.user.lastName : 'Client inconnu',
      reason: d.reason,
      amount: Number(d.booking.totalPrice),
      status: d.status,
      createdAt: d.createdAt.toISOString()
    }))
  }

  return <AdminDashboardContent data={dashboardData} />
}
