import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const adminActionSchema = z.object({
  action: z.enum(['validate_truck', 'reject_truck', 'suspend_truck', 'validate_kyc', 'reject_kyc', 'suspend_user', 'resolve_dispute']),
  entityId: z.string(),
  reason: z.string().optional(),
  resolution: z.string().optional(),
})

// GET — Admin stats
export async function GET(request: NextRequest) {
  try {
    const role = request.headers.get('x-user-role')
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 })
    }

    const [
      totalUsers, activeUsers,
      totalTrucks, pendingTrucks, validatedTrucks,
      totalBookings, activeBookings,
      openDisputes,
      totalPayments,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.truck.count(),
      prisma.truck.count({ where: { status: 'PENDING_VALIDATION' } }),
      prisma.truck.count({ where: { status: 'VALIDATED' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: { in: ['IN_PROGRESS', 'PAYMENT_SECURED', 'DRIVER_ASSIGNED'] } } }),
      prisma.dispute.count({ where: { status: 'OPEN' } }),
      prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'RELEASED' } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        users: { total: totalUsers, active: activeUsers },
        trucks: { total: totalTrucks, pending: pendingTrucks, validated: validatedTrucks },
        bookings: { total: totalBookings, active: activeBookings },
        disputes: { open: openDisputes },
        revenue: { total: totalPayments._sum.amount || 0 },
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST — Admin actions
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    const role = request.headers.get('x-user-role')
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const { action, entityId, reason, resolution } = adminActionSchema.parse(body)

    switch (action) {
      case 'validate_truck':
        await prisma.truck.update({
          where: { id: entityId },
          data: {
            status: 'VALIDATED',
            validatedAt: new Date(),
            validatedBy: userId,
          },
        })
        // Notify owner
        const truck = await prisma.truck.findUnique({ where: { id: entityId }, include: { owner: true } })
        if (truck) {
          await prisma.notification.create({
            data: {
              userId: truck.owner.userId,
              type: 'TRUCK_VALIDATED',
              title: 'Camion validé ! 🎉',
              body: `Votre ${truck.brand} ${truck.model} a été validé. Vous pouvez commencer à recevoir des demandes.`,
              channels: ['IN_APP', 'SMS'],
            },
          })
        }
        return NextResponse.json({ success: true, message: 'Camion validé' })

      case 'reject_truck':
        await prisma.truck.update({
          where: { id: entityId },
          data: { status: 'REJECTED', rejectionReason: reason },
        })
        return NextResponse.json({ success: true, message: 'Camion refusé' })

      case 'suspend_truck':
        await prisma.truck.update({
          where: { id: entityId },
          data: { status: 'SUSPENDED' },
        })
        return NextResponse.json({ success: true, message: 'Camion suspendu' })

      case 'validate_kyc':
        await prisma.truckOwner.update({
          where: { id: entityId },
          data: { kycStatus: 'VERIFIED', kycVerifiedAt: new Date(), kycVerifiedBy: userId },
        })
        return NextResponse.json({ success: true, message: 'KYC validé' })

      case 'suspend_user':
        await prisma.user.update({
          where: { id: entityId },
          data: { status: 'SUSPENDED' },
        })
        return NextResponse.json({ success: true, message: 'Utilisateur suspendu' })

      case 'resolve_dispute':
        await prisma.dispute.update({
          where: { id: entityId },
          data: {
            status: 'RESOLVED',
            resolution: resolution || 'Résolu par l\'administration',
            resolvedBy: userId,
            resolvedAt: new Date(),
          },
        })
        return NextResponse.json({ success: true, message: 'Litige résolu' })

      default:
        return NextResponse.json({ success: false, error: 'Action invalide' }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 })
    }
    console.error('Admin action error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
