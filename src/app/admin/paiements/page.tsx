import React from 'react'
import prisma from '@/lib/prisma'
import { AdminPaymentsClient } from '@/components/admin/AdminPaymentsClient'

export const dynamic = 'force-dynamic'

export default async function AdminPaymentsPage() {
  const paymentsDb = await prisma.payment.findMany({
    include: {
      booking: {
        include: { client: { include: { user: true } } }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const paymentsData = paymentsDb.map(p => ({
    id: p.id,
    amount: Number(p.amount),
    platformFee: Number(p.platformFee),
    ownerAmount: Number(p.ownerAmount),
    method: p.method,
    status: p.status,
    bookingNumber: p.booking.bookingNumber,
    clientName: p.booking.client ? p.booking.client.user.firstName + ' ' + p.booking.client.user.lastName : 'Inconnu',
    createdAt: p.createdAt.toISOString()
  }))

  return <AdminPaymentsClient initialPayments={paymentsData} />
}
