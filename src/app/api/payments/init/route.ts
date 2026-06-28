import { NextRequest, NextResponse } from 'next/server'
import { initiatePayment, PaymentOperator } from '@/lib/payment'
import { getUserSession } from '@/lib/session'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserSession();
    const body = await request.json();
    
    const { amount, method, bookingId, phone } = body;

    if (!amount || !method || !bookingId) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // Verify booking and payment
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true }
    });

    if (!booking || !booking.payment) {
      return NextResponse.json(
        { success: false, error: 'Réservation ou paiement introuvable' },
        { status: 404 }
      );
    }

    if (booking.status !== 'AWAITING_PAYMENT') {
      return NextResponse.json(
        { success: false, error: 'Cette réservation n\'est pas en attente de paiement' },
        { status: 400 }
      );
    }
    
    // Mapper la méthode envoyée depuis le frontend vers le PaymentOperator
    let operator: PaymentOperator = 'simulated';
    if (method === 'ORANGE_MONEY') operator = 'orange_money';
    else if (method === 'WAVE') operator = 'wave';
    else if (method === 'CARD_VISA' || method === 'CARD_MASTERCARD') operator = 'cinetpay';

    if (method === 'SIMULATED') {
      // Direct success simulation
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: booking.payment.id },
          data: { status: 'SECURED', method: 'SIMULATED' }
        }),
        prisma.booking.update({
          where: { id: bookingId },
          data: { status: 'PAYMENT_SECURED' }
        })
      ]);

      return NextResponse.json({
        success: true,
        providerRef: 'SIMULATED_' + Date.now(),
        redirectUrl: null,
        message: 'Paiement simulé avec succès',
        bookingId: booking.id
      });
    }

    const origin = request.headers.get('origin') || process.env.APP_URL || 'http://localhost:3000';

    const paymentResult = await initiatePayment(operator, {
      amount,
      currency: process.env.CURRENCY_DEFAULT || 'XOF',
      phone,
      description: `Paiement réservation ${booking.bookingNumber}`,
      bookingId: booking.id,
      returnUrl: `${origin}/paiement/retour?bookingId=${booking.id}`,
      webhookUrl: `${process.env.APP_URL || origin}/api/webhooks/payment`,
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.error },
        { status: 500 }
      );
    }

    // Update payment method with chosen one
    await prisma.payment.update({
      where: { id: booking.payment.id },
      data: { method: method as any }
    });

    return NextResponse.json({
      success: true,
      providerRef: paymentResult.providerRef,
      redirectUrl: paymentResult.redirectUrl || null,
      message: paymentResult.message,
      bookingId: booking.id
    });

  } catch (error) {
    console.error('Payment Init Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de l\'initialisation du paiement' },
      { status: 500 }
    );
  }
}
