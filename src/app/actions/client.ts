'use server'

import prisma from '@/lib/prisma'
import { getUserSession } from '@/lib/session'
import { calculatePrice } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function createBooking(data: {
  truckId: string,
  serviceType: any,
  departureAddress: string,
  arrivalAddress: string,
  scheduledAt: string,
  estimatedDistKm: number,
  nbHandlers: number,
  cargoDescription: string,
  specialRequirements: string,
  isUrgent: boolean
}) {
  try {
    const sessionUser = await getUserSession()
    if (!sessionUser) {
      return { success: false, message: 'Veuillez vous connecter pour réserver.' }
    }

    // Ensure the user is a client and has a client profile
    let client = await prisma.client.findUnique({
      where: { userId: sessionUser.id }
    })
    if (!client) {
      client = await prisma.client.create({
        data: { userId: sessionUser.id }
      })
    }

    // Fetch truck and its pricing
    const truck = await prisma.truck.findUnique({
      where: { id: data.truckId },
      include: { city: { include: { country: true } } }
    })

    if (!truck) {
      return { success: false, message: 'Camion introuvable.' }
    }

    // Use default commission for now (12%)
    const commissionPercent = 12

    const pricing = calculatePrice({
      basePrice: Number(truck.basePrice),
      distanceKm: data.estimatedDistKm,
      pricePerKm: truck.pricePerKm ? Number(truck.pricePerKm) : undefined,
      nbHandlers: data.nbHandlers,
      isUrgent: data.isUrgent,
      commissionPercent
    })

    // Generate a booking number
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '')
    const rand = Math.floor(1000 + Math.random() * 9000)
    const bookingNumber = `B-${dateStr}-${rand}`

    const booking = await prisma.booking.create({
      data: {
        bookingNumber,
        clientId: client.id,
        truckId: truck.id,
        serviceType: data.serviceType,
        status: 'AWAITING_PAYMENT',
        basePrice: truck.basePrice,
        totalPrice: pricing.totalPrice,
        platformFee: pricing.platformFee,
        currency: truck.currency,
        departureAddress: data.departureAddress,
        arrivalAddress: data.arrivalAddress,
        scheduledAt: new Date(data.scheduledAt),
        estimatedDistKm: data.estimatedDistKm,
        nbHandlers: data.nbHandlers,
        cargoDescription: data.cargoDescription,
        specialRequirements: data.specialRequirements,
        isUrgent: data.isUrgent,
      }
    })

    // Create a pending payment right away
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice,
        platformFee: booking.platformFee,
        ownerAmount: pricing.ownerAmount,
        currency: booking.currency,
        method: 'ORANGE_MONEY', // Default, to be chosen later
        status: 'PENDING'
      }
    })

    revalidatePath('/admin/reservations')
    
    return { 
      success: true, 
      bookingId: booking.id, 
      bookingNumber: booking.bookingNumber,
      amount: pricing.totalPrice 
    }
  } catch (error) {
    console.error('Error creating booking:', error)
    return { success: false, message: 'Une erreur est survenue lors de la réservation.' }
  }
}
