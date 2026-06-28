import { NextRequest, NextResponse } from 'next/server'
import { getUserSession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Non autorisé' }, { status: 401 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { truck: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Réservation introuvable' }, { status: 404 });
    }

    // Verify it's the owner or driver calling this
    const owner = await prisma.truckOwner.findUnique({ where: { userId: user.id } });
    if (!owner || booking.truck.ownerId !== owner.id) {
      return NextResponse.json({ success: false, error: 'Action non autorisée' }, { status: 403 });
    }

    if (booking.status !== 'IN_PROGRESS') {
      return NextResponse.json({ success: false, error: 'Statut invalide pour terminer' }, { status: 400 });
    }

    // Update booking
    await prisma.booking.update({
      where: { id },
      data: {
        status: 'COMPLETED_PENDING_VALIDATION',
        completedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, message: 'Mission terminée avec succès' });

  } catch (error) {
    console.error('Complete Mission Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de la fin de mission' },
      { status: 500 }
    );
  }
}
