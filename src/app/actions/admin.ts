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

// ----------------------------------------------------------------------------
// GESTION DES PAIEMENTS
// ----------------------------------------------------------------------------

export async function releasePayment(paymentId: string) {
  try {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { 
        status: 'RELEASED',
        releasedAt: new Date()
      }
    })
    revalidatePath('/admin/paiements')
    revalidatePath('/admin')
    return { success: true, message: 'Fonds libérés au propriétaire.' }
  } catch (error) {
    console.error('Error releasing payment:', error)
    return { success: false, message: 'Erreur lors de la libération des fonds.' }
  }
}

export async function refundPayment(paymentId: string) {
  try {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { 
        status: 'REFUNDED',
        refundedAt: new Date()
      }
    })
    revalidatePath('/admin/paiements')
    revalidatePath('/admin')
    return { success: true, message: 'Paiement remboursé au client.' }
  } catch (error) {
    console.error('Error refunding payment:', error)
    return { success: false, message: 'Erreur lors du remboursement.' }
  }
}

// ----------------------------------------------------------------------------
// GESTION DES LITIGES
// ----------------------------------------------------------------------------

export async function resolveDispute(disputeId: string, resolutionType: 'RESOLVED' | 'PARTIAL_REFUND' | 'FULL_REFUND') {
  try {
    await prisma.dispute.update({
      where: { id: disputeId },
      data: { 
        status: resolutionType,
        resolvedAt: new Date()
      }
    })
    revalidatePath('/admin/litiges')
    revalidatePath('/admin')
    return { success: true, message: 'Litige statué avec succès.' }
  } catch (error) {
    console.error('Error resolving dispute:', error)
    return { success: false, message: 'Erreur lors de la résolution du litige.' }
  }
}
