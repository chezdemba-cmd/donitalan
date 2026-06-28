import React from 'react'
import prisma from '@/lib/prisma'
import { AdminBookingsClient } from '@/components/admin/AdminBookingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminReservationsPage() {
  // Fetch all bookings with clients, trucks, owners and payments
  const bookingsDb = await prisma.booking.findMany({
    include: {
      client: {
        include: { user: true }
      },
      truck: {
        include: { owner: { include: { user: true } } }
      },
      payment: true
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
    ownerName: b.truck.owner.user.firstName + ' ' + b.truck.owner.user.lastName,
    departureCity: b.departureCity || b.departureAddress,
    arrivalCity: b.arrivalCity || b.arrivalAddress,
    totalPrice: Number(b.totalPrice),
    ownerAmount: b.payment ? Number(b.payment.ownerAmount) : 0,
    platformFee: b.payment ? Number(b.payment.platformFee) : 0,
    scheduledAt: b.scheduledAt.toISOString(),
    createdAt: b.createdAt.toISOString()
  }))

  return <AdminBookingsClient initialBookings={bookingsData} />
}
