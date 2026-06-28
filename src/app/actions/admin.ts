'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

// ----------------------------------------------------------------------------
// GESTION DES CAMIONS
// ----------------------------------------------------------------------------

export async function validateTruck(truckId: string) {
  try {
    await prisma.truck.update({
      where: { id: truckId },
      data: { status: 'VALIDATED' }
    })
    revalidatePath('/admin/camions')
    revalidatePath('/admin')
    return { success: true, message: 'Camion validé avec succès.' }
  } catch (error) {
    console.error('Error validating truck:', error)
    return { success: false, message: 'Erreur lors de la validation du camion.' }
  }
}

export async function rejectTruck(truckId: string) {
  try {
    await prisma.truck.update({
      where: { id: truckId },
      data: { status: 'SUSPENDED' } // Ou REJECTED si vous l'ajoutez à l'enum
    })
    revalidatePath('/admin/camions')
    revalidatePath('/admin')
    return { success: true, message: 'Camion refusé/suspendu.' }
  } catch (error) {
    console.error('Error rejecting truck:', error)
    return { success: false, message: 'Erreur lors du refus du camion.' }
  }
}

// ----------------------------------------------------------------------------
// GESTION DES UTILISATEURS
// ----------------------------------------------------------------------------

export async function suspendUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { status: 'SUSPENDED' }
    })
    revalidatePath('/admin/utilisateurs')
    revalidatePath('/admin')
    return { success: true, message: 'Utilisateur suspendu avec succès.' }
  } catch (error) {
    console.error('Error suspending user:', error)
    return { success: false, message: 'Erreur lors de la suspension.' }
  }
}

export async function forceVerifyUser(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        status: 'ACTIVE',
        phoneVerified: true
      }
    })
    revalidatePath('/admin/utilisateurs')
    revalidatePath('/admin')
    return { success: true, message: 'Compte validé avec succès.' }
  } catch (error) {
    console.error('Error verifying user:', error)
    return { success: false, message: 'Erreur lors de la validation.' }
  }
}
