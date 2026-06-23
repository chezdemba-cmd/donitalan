import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { calculatePrice, generateBookingNumber } from '@/lib/utils'
import { createOTP, sendOTPSms } from '@/lib/otp'
import { z } from 'zod'

const createBookingSchema = z.object({
  truckId: z.string(),
  serviceType: z.string(),
  departureAddress: z.string().min(5),
  departureLat: z.number().optional(),
  departureLng: z.number().optional(),
  arrivalAddress: z.string().min(5),
  arrivalLat: z.number().optional(),
  arrivalLng: z.number().optional(),
  estimatedDistKm: z.number().optional(),
  scheduledAt: z.string().datetime(),
  estimatedDuration: z.number().optional(),
  cargoDescription: z.string().optional(),
  cargoWeightKg: z.number().optional(),
  nbHandlers: z.number().default(0),
  specialRequirements: z.string().optional(),
  notes: z.string().optional(),
  isUrgent: z.boolean().default(false),
})

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ success: false, error: 'Utilisateur non trouvé' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 10

    let where: Record<string, unknown> = {}

    if (user.role === 'CLIENT' || user.role === 'COMPANY') {
      const client = await prisma.client.findUnique({ where: { userId } })
      where = client ? { clientId: client.id } : { id: 'none' }
    } else if (user.role === 'TRUCK_OWNER') {
      const owner = await prisma.truckOwner.findUnique({ where: { userId } })
      if (owner) {
        const trucks = await prisma.truck.findMany({ where: { ownerId: owner.id }, select: { id: true } })
        where = { truckId: { in: trucks.map(t => t.id) } }
      }
    } else if (user.role === 'DRIVER') {
      const driver = await prisma.driver.findUnique({ where: { userId } })
      where = driver ? { driverId: driver.id } : { id: 'none' }
    }

    if (status) where.status = status

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          truck: { select: { brand: true, model: true, truckType: true, photoUrls: true } },
          payment: { select: { status: true, amount: true, method: true } },
          driver: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.booking.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: bookings,
      meta: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    })
  } catch (error) {
    console.error('Bookings GET error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const body = await request.json()
    const data = createBookingSchema.parse(body)

    // Get truck details for pricing
    const truck = await prisma.truck.findUnique({
      where: { id: data.truckId, status: 'VALIDATED' },
    })
    if (!truck) {
      return NextResponse.json({ success: false, error: 'Camion non disponible' }, { status: 404 })
    }

    // Get client profile
    const client = await prisma.client.findUnique({ where: { userId } })
    if (!client) {
      return NextResponse.json({ success: false, error: 'Profil client requis' }, { status: 403 })
    }

    // Calculate pricing
    const pricing = calculatePrice({
      basePrice: truck.basePrice.toNumber(),
      distanceKm: data.estimatedDistKm,
      pricePerKm: truck.pricePerKm?.toNumber(),
      durationHours: data.estimatedDuration,
      pricePerHour: truck.pricePerHour?.toNumber(),
      nbHandlers: data.nbHandlers,
      isUrgent: data.isUrgent,
      commissionPercent: parseFloat(process.env.PLATFORM_COMMISSION_PERCENT || '12'),
    })

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        clientId: client.id,
        truckId: data.truckId,
        serviceType: data.serviceType as never,
        status: 'PENDING_OWNER_ACCEPTANCE',
        departureAddress: data.departureAddress,
        departureLat: data.departureLat,
        departureLng: data.departureLng,
        arrivalAddress: data.arrivalAddress,
        arrivalLat: data.arrivalLat,
        arrivalLng: data.arrivalLng,
        estimatedDistKm: data.estimatedDistKm,
        scheduledAt: new Date(data.scheduledAt),
        estimatedDuration: data.estimatedDuration,
        basePrice: pricing.basePrice,
        distancePrice: pricing.distancePrice,
        handlingFee: pricing.handlingFee,
        urgencyFee: pricing.urgencyFee,
        platformFee: pricing.platformFee,
        totalPrice: pricing.totalPrice,
        cargoDescription: data.cargoDescription,
        cargoWeightKg: data.cargoWeightKg,
        nbHandlers: data.nbHandlers,
        specialRequirements: data.specialRequirements,
        notes: data.notes,
        statusHistory: {
          create: {
            status: 'PENDING_OWNER_ACCEPTANCE',
            changedBy: userId,
            note: 'Réservation créée',
          },
        },
      },
      include: {
        truck: { include: { owner: { include: { user: true } } } },
        client: { include: { user: true } },
      },
    })

    // Notify truck owner
    const ownerUser = booking.truck.owner.user
    await prisma.notification.create({
      data: {
        userId: ownerUser.id,
        type: 'BOOKING_REQUEST',
        title: 'Nouvelle demande de transport',
        body: `${booking.client?.user.firstName} vous a envoyé une demande pour le ${new Date(data.scheduledAt).toLocaleDateString('fr-FR')}`,
        data: { bookingId: booking.id },
        channels: ['IN_APP', 'SMS'],
      },
    })

    return NextResponse.json({ success: true, data: booking }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Données invalides', details: error.errors }, { status: 400 })
    }
    console.error('Booking create error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
