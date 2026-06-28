import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserSession();
    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { 
        payment: true,
        truck: { include: { owner: true } }
      }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Réservation introuvable' }, { status: 404 });
    }

    if (booking.status !== 'COMPLETED_PENDING_VALIDATION') {
      return NextResponse.json({ success: false, error: 'Statut invalide pour validation' }, { status: 400 });
    }

    // Begin transaction to update booking, payment, and create payout
    await prisma.$transaction(async (tx) => {
      // 1. Update booking status
      await tx.booking.update({
        where: { id },
        data: { status: 'COMPLETED' }
      });

      // 2. Update payment status
      if (booking.payment) {
        await tx.payment.update({
          where: { id: booking.payment.id },
          data: { 
            status: 'RELEASED',
            releasedAt: new Date()
          }
        });

        // 3. Create payout for the owner
        await tx.payout.create({
          data: {
            ownerId: booking.truck.owner.id,
            paymentId: booking.payment.id,
            amount: booking.payment.ownerAmount,
            currency: booking.payment.currency,
            method: 'ORANGE_MONEY', // Defaulting for MVP
            status: 'PENDING',
            phoneNumber: booking.truck.owner.mobileMoneyNumber || '',
            notes: `Payout for booking ${booking.bookingNumber}`
          }
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Mission validée et paiement initié' });

  } catch (error) {
    console.error('Validate Mission Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de la validation' },
      { status: 500 }
    );
  }
}
