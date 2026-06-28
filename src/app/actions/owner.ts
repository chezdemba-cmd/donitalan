'use server'

import prisma from '@/lib/prisma'
import { getUserSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import type { TruckType } from '@/types'

export async function createTruck(formData: {
  brand: string
  model: string
  year: number
  licensePlate: string
  truckType: TruckType
  capacityTons: number
  volumeM3?: number
  basePrice: number
  pricePerKm?: number
  cityId: string
  zones: string[]
  withDriver: boolean
  description?: string
}) {
  try {
    const user = await getUserSession()
    if (!user || user.role !== 'TRUCK_OWNER') {
      return { success: false, message: 'Non autorisé' }
    }

    const owner = await prisma.truckOwner.findUnique({
      where: { userId: user.id }
    })

    if (!owner) {
      return { success: false, message: 'Profil propriétaire introuvable' }
    }

    // Create the truck
    const truck = await prisma.truck.create({
      data: {
        ownerId: owner.id,
        brand: formData.brand,
        model: formData.model,
        year: formData.year,
        licensePlate: formData.licensePlate,
        truckType: formData.truckType,
        capacityTons: formData.capacityTons,
        volumeM3: formData.volumeM3 || null,
        basePrice: formData.basePrice,
        pricePerKm: formData.pricePerKm || null,
        cityId: formData.cityId,
        zones: formData.zones,
        withDriver: formData.withDriver,
        description: formData.description || '',
        status: 'PENDING_VALIDATION',
      }
    })

    revalidatePath('/proprietaire')
    revalidatePath('/admin/camions')
    
    return { success: true, truckId: truck.id }
  } catch (error: any) {
    console.error('Error creating truck:', error)
    if (error.code === 'P2002' && error.meta?.target?.includes('licensePlate')) {
      return { success: false, message: 'Cette plaque d\'immatriculation existe déjà.' }
    }
    return { success: false, message: 'Erreur lors de la création du camion' }
  }
}
