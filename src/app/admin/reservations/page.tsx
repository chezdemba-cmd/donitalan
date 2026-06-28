import React from 'react'
import prisma from '@/lib/prisma'
import { AdminBookingsClient } from '@/components/admin/AdminBookingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminReservationsPage() {
  // Fetch all bookings with clients and trucks
  const bookingsDb = await prisma.booking.findMany({
    include: {
      client: {
        include: { user: true }
      },
      truck: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Format data for the client component
  const bookingsData = bookingsDb.map(b => ({
    id: b.id,
    bookingNumber: b.bookingNumber,
    serviceType: b.serviceType,
    status: b.status,
    clientName: b.client ? b.client.user.firstName + ' ' + b.client.user.lastName : 'Client supprimé',
    truckName: b.truck.brand + ' ' + b.truck.model,
    departureCity: b.departureCity,
    arrivalCity: b.arrivalCity,
    totalPrice: Number(b.totalPrice),
    scheduledAt: b.scheduledAt.toISOString(),
    createdAt: b.createdAt.toISOString()
  }))

  return <AdminBookingsClient initialBookings={bookingsData} />
}
