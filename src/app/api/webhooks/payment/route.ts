import { NextRequest, NextResponse } from 'next/server'
// import prisma from '@/lib/prisma'

// Webhook for payment provider callbacks (Orange Money, Wave, CinetPay)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const provider = request.headers.get('x-payment-provider') || 'unknown'

    console.log(`[WEBHOOK] Notification de paiement reçue (${provider}):`, body)

    // Logique métier (Gate 5) :
    // 1. Vérifier la signature HMAC du payload pour sécuriser l'endpoint.
    // 2. Extraire la référence de la transaction (providerRef ou bookingId).
    // 3. Mettre à jour la base de données (si le serveur BDD était actif) :
    // 
    // await prisma.payment.update({ where: { providerRef: body.ref }, data: { status: 'SECURED' } });
    // await prisma.booking.update({ where: { id: body.order_id }, data: { status: 'PAYMENT_SECURED' } });

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error)
    return NextResponse.json({ success: false, error: 'Webhook processing failed' }, { status: 500 })
  }
}
