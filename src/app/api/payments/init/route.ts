import { NextRequest, NextResponse } from 'next/server'
import { initiatePayment, PaymentOperator } from '@/lib/payment'
import { getUserSession } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const user = await getUserSession();
    const body = await request.json();
    
    const { amount, method, truckId, phone } = body;

    if (!amount || !method || !truckId) {
      return NextResponse.json(
        { success: false, error: 'Données manquantes' },
        { status: 400 }
      );
    }

    // En l'absence de base de données PostgreSQL active (Mode MVP / Demo), 
    // on génère un faux ID de réservation. En production, on créerait une entrée dans la table Booking.
    const bookingId = `BK-${Date.now()}`;
    
    // Mapper la méthode envoyée depuis le frontend vers le PaymentOperator
    // method peut être 'ORANGE_MONEY', 'WAVE', 'SIMULATED', etc.
    let operator: PaymentOperator = 'simulated';
    if (method === 'ORANGE_MONEY') operator = 'orange_money';
    else if (method === 'WAVE') operator = 'wave';
    else if (method === 'CARD_VISA' || method === 'CARD_MASTERCARD') operator = 'cinetpay';

    const origin = request.headers.get('origin') || process.env.APP_URL || 'http://localhost:3000';

    const paymentResult = await initiatePayment(operator, {
      amount,
      currency: process.env.CURRENCY_DEFAULT || 'XOF',
      phone,
      description: `Paiement réservation ${bookingId} - Camion ${truckId}`,
      bookingId,
      returnUrl: `${origin}/paiement/retour?bookingId=${bookingId}`,
      webhookUrl: `${process.env.APP_URL || origin}/api/webhooks/payment`,
    });

    if (!paymentResult.success) {
      return NextResponse.json(
        { success: false, error: paymentResult.error },
        { status: 500 }
      );
    }

    // Le mode simulé retournera un succès immédiatement.
    // Les vrais opérateurs retourneront une URL de redirection (`redirectUrl`).
    return NextResponse.json({
      success: true,
      providerRef: paymentResult.providerRef,
      redirectUrl: paymentResult.redirectUrl || null,
      message: paymentResult.message,
      bookingId
    });

  } catch (error) {
    console.error('Payment Init Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur lors de l\'initialisation du paiement' },
      { status: 500 }
    );
  }
}
