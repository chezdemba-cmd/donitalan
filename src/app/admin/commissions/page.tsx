import React from 'react'
import prisma from '@/lib/prisma'
import { AdminCommissionsClient } from '@/components/admin/AdminCommissionsClient'

export const dynamic = 'force-dynamic'

export default async function AdminCommissionsPage() {
  const commissionsDb = await prisma.commission.findMany({
    orderBy: { createdAt: 'desc' }
  })

  const commissionsData = commissionsDb.map(c => ({
    id: c.id,
    name: c.name,
    percent: Number(c.percent),
    serviceType: c.serviceType,
    active: c.active,
    createdAt: c.createdAt.toISOString()
  }))

  return <AdminCommissionsClient initialCommissions={commissionsData} />
}
