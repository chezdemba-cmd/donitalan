import React from 'react'
import prisma from '@/lib/prisma'
import { AdminDisputesClient } from '@/components/admin/AdminDisputesClient'

export const dynamic = 'force-dynamic'

export default async function AdminDisputesPage() {
  const disputesDb = await prisma.dispute.findMany({
    include: {
      booking: true,
      client: { include: { user: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  const disputesData = disputesDb.map(d => ({
    id: d.id,
    bookingNumber: d.booking.bookingNumber,
    clientName: d.client ? d.client.user.firstName + ' ' + d.client.user.lastName : 'Inconnu',
    reason: d.reason,
    description: d.description,
    status: d.status,
    amount: Number(d.booking.totalPrice), // Simplified for MVP
    createdAt: d.createdAt.toISOString()
  }))

  return <AdminDisputesClient initialDisputes={disputesData} />
}
