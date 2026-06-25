import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const truck = await prisma.truck.findUnique({
      where: { id },
      include: {
        city: { include: { country: true } },
        owner: {
          include: {
            user: {
              select: {
                firstName: true, lastName: true,
                avatarUrl: true, phone: true, createdAt: true,
              },
            },
          },
        },
        documents: { where: { verified: true } },
        reviews: {
          include: {
            author: { select: { firstName: true, lastName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { bookings: true, reviews: true } },
      },
    })

    if (!truck) {
      return NextResponse.json({ success: false, error: 'Camion non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: truck })
  } catch (error) {
    console.error('Truck GET error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

const updateTruckSchema = z.object({
  brand: z.string().optional(),
  model: z.string().optional(),
  description: z.string().optional(),
  basePrice: z.number().positive().optional(),
  pricePerKm: z.number().optional(),
  pricePerHour: z.number().optional(),
  zones: z.array(z.string()).optional(),
  withDriver: z.boolean().optional(),
  photoUrls: z.array(z.string()).optional(),
  availableFrom: z.string().datetime().optional(),
  availableTo: z.string().datetime().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })
    }

    const truck = await prisma.truck.findUnique({
      where: { id },
      include: { owner: true },
    })

    if (!truck) {
      return NextResponse.json({ success: false, error: 'Camion non trouvé' }, { status: 404 })
    }

    if (truck.owner.userId !== userId) {
      return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 })
    }

    const body = await request.json()
    const data = updateTruckSchema.parse(body)

    const updated = await prisma.truck.update({
      where: { id },
      data,
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    console.error('Truck update error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
