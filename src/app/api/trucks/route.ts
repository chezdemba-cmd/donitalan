import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const querySchema = z.object({
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(12),
  cityId: z.string().optional(),
  truckType: z.string().optional(),
  serviceType: z.string().optional(),
  minCapacity: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  withDriver: z.coerce.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['price_asc', 'price_desc', 'rating', 'trips']).default('rating'),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const params = querySchema.parse(Object.fromEntries(searchParams))

    const where: Record<string, unknown> = {
      status: 'VALIDATED',
    }

    if (params.cityId) where.cityId = params.cityId
    if (params.truckType) where.truckType = params.truckType
    if (params.withDriver !== undefined) where.withDriver = params.withDriver
    if (params.minCapacity) where.capacityTons = { gte: params.minCapacity }
    if (params.maxPrice) where.basePrice = { lte: params.maxPrice }
    if (params.search) {
      where.OR = [
        { brand: { contains: params.search, mode: 'insensitive' } },
        { model: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ]
    }

    const orderBy: Record<string, string> = {
      rating: 'averageRating',
      trips: 'totalTrips',
      price_asc: 'basePrice',
      price_desc: 'basePrice',
    }

    const [trucks, total] = await Promise.all([
      prisma.truck.findMany({
        where,
        include: {
          city: { include: { country: true } },
          owner: { include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
          _count: { select: { reviews: true } },
        },
        orderBy: { [orderBy[params.sortBy] || 'averageRating']: params.sortBy === 'price_asc' ? 'asc' : 'desc' },
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
      }),
      prisma.truck.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: trucks,
      meta: {
        total,
        page: params.page,
        pageSize: params.pageSize,
        totalPages: Math.ceil(total / params.pageSize),
      },
    })
  } catch (error) {
    console.error('Trucks GET error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

const createTruckSchema = z.object({
  brand: z.string().min(2),
  model: z.string().min(1),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(3),
  truckType: z.string(),
  capacityTons: z.number().positive(),
  volumeM3: z.number().positive().optional(),
  description: z.string().optional(),
  basePrice: z.number().positive(),
  pricePerKm: z.number().optional(),
  pricePerHour: z.number().optional(),
  cityId: z.string(),
  zones: z.array(z.string()).default([]),
  withDriver: z.boolean().default(true),
  photoUrls: z.array(z.string()).default([]),
})

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const owner = await prisma.truckOwner.findUnique({ where: { userId } })
    if (!owner) {
      return NextResponse.json({ success: false, error: 'Compte propriétaire requis' }, { status: 403 })
    }

    const body = await request.json()
    const data = createTruckSchema.parse(body)

    const truck = await prisma.truck.create({
      data: {
        ...data,
        ownerId: owner.id,
        status: 'PENDING_VALIDATION',
        currency: 'XOF',
      },
      include: { city: true },
    })

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'TRUCK_CREATED',
        entity: 'Truck',
        entityId: truck.id,
        newData: { brand: data.brand, model: data.model },
      },
    })

    return NextResponse.json({ success: true, data: truck }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Données invalides', details: error.flatten().fieldErrors }, { status: 400 })
    }
    console.error('Truck create error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
