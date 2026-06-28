import React from 'react'
import prisma from '@/lib/prisma'
import { AdminTrucksClient } from '@/components/admin/AdminTrucksClient'

export const dynamic = 'force-dynamic'

export default async function AdminCamionsPage() {
  // Fetch all trucks with their owners and cities
  const trucksDb = await prisma.truck.findMany({
    include: {
      owner: {
        include: {
          user: true
        }
      },
      city: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Format data for the client component
  const trucksData = trucksDb.map(t => ({
    id: t.id,
    brand: t.brand,
    model: t.model,
    licensePlate: t.licensePlate,
    type: t.truckType,
    basePrice: Number(t.basePrice),
    status: t.status,
    createdAt: t.createdAt.toISOString(),
    ownerName: t.owner.user.firstName + ' ' + t.owner.user.lastName,
    cityName: t.city.name
  }))

  return <AdminTrucksClient initialTrucks={trucksData} />
}
