import React from 'react'
import prisma from '@/lib/prisma'
import { AdminUsersClient } from '@/components/admin/AdminUsersClient'

export const dynamic = 'force-dynamic'

export default async function AdminUtilisateursPage() {
  // Fetch all users
  const usersDb = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Format data for the client component
  const usersData = usersDb.map(u => ({
    id: u.id,
    fullName: u.firstName + ' ' + u.lastName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    phoneVerified: u.phoneVerified,
    createdAt: u.createdAt.toISOString()
  }))

  return <AdminUsersClient initialUsers={usersData} />
}
