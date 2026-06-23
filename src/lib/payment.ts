/**
 * Payment Adapter — DoniTalan
 * Architecture abstraite permettant d'intégrer plusieurs opérateurs de paiement.
 * En mode "simulated", le paiement est accepté automatiquement.
 * En production, remplacer "simulated" par l'opérateur réel.
 */

export type PaymentOperator = 'simulated' | 'orange_money' | 'wave' | 'moov_money' | 'cinetpay'

export interface PaymentInitParams {
  amount: number
  currency: string
  phone?: string
  description: string
  bookingId: string
  returnUrl: string
  webhookUrl: string
  metadata?: Record<string, string>
}

export interface PaymentInitResult {
  success: boolean
  providerRef?: string
  redirectUrl?: string
  ussdCode?: string
  message?: string
  error?: string
}

export interface PaymentStatusResult {
  status: 'pending' | 'success' | 'failed' | 'cancelled'
  providerRef?: string
  paidAt?: Date
  message?: string
}

// ============================================================
// SIMULATED PAYMENT (MVP)
// ============================================================
async function initiateSimulated(params: PaymentInitParams): Promise<PaymentInitResult> {
  console.log(`[PAIEMENT SIMULÉ] Montant: ${params.amount} ${params.currency} pour ${params.bookingId}`)
  
  // Simule un délai réseau
  await new Promise(resolve => setTimeout(resolve, 800))
  
  return {
    success: true,
    providerRef: `SIM-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
    message: 'Paiement simulé initié avec succès',
  }
}

// ============================================================
// ORANGE MONEY (Mali / Côte d'Ivoire / Sénégal)
// ============================================================
async function initiateOrangeMoney(params: PaymentInitParams): Promise<PaymentInitResult> {
  // Orange Money Mali API — https://developer.orange.com/apis/om-mali-bf/api-reference
  // À configurer avec les vraies clés en production
  const baseUrl = process.env.ORANGE_MONEY_API_URL || 'https://api.orange.com/orange-money-webpay/ml/v1'
  const merchantKey = process.env.ORANGE_MONEY_MERCHANT_KEY || ''
  
  try {
    const response = await fetch(`${baseUrl}/webpayment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${merchantKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchant_key: merchantKey,
        currency: params.currency === 'XOF' ? 'OUV' : params.currency,
        order_id: params.bookingId,
        amount: params.amount,
        return_url: params.returnUrl,
        cancel_url: `${params.returnUrl}?status=cancelled`,
        notif_url: params.webhookUrl,
        lang: 'fr',
        reference: `DT-${params.bookingId}`,
      }),
    })
    
    if (!response.ok) throw new Error(`Orange Money API error: ${response.status}`)
    const data = await response.json()
    
    return {
      success: true,
      providerRef: data.pay_token,
      redirectUrl: data.payment_url,
      message: 'Paiement Orange Money initié',
    }
  } catch (error) {
    return { success: false, error: 'Erreur Orange Money. Réessayez.' }
  }
}

// ============================================================
// WAVE (Mali / Sénégal / Côte d'Ivoire)
// ============================================================
async function initiateWave(params: PaymentInitParams): Promise<PaymentInitResult> {
  // Wave API — https://docs.wave.com/business-api
  const apiKey = process.env.WAVE_API_KEY || ''
  
  try {
    const response = await fetch('https://api.wave.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount.toString(),
        currency: params.currency,
        error_url: `${params.returnUrl}?status=error`,
        success_url: `${params.returnUrl}?status=success`,
        client_reference: params.bookingId,
      }),
    })
    
    if (!response.ok) throw new Error(`Wave API error: ${response.status}`)
    const data = await response.json()
    
    return {
      success: true,
      providerRef: data.id,
      redirectUrl: data.wave_launch_url,
      message: 'Paiement Wave initié',
    }
  } catch (error) {
    return { success: false, error: 'Erreur Wave. Réessayez.' }
  }
}

// ============================================================
// CINETPAY (Cartes bancaires + Mobile Money)
// ============================================================
async function initiateCinetpay(params: PaymentInitParams): Promise<PaymentInitResult> {
  const apiKey = process.env.CINETPAY_APIKEY || ''
  const siteId = process.env.CINETPAY_SITE_ID || ''
  
  try {
    const response = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: apiKey,
        site_id: siteId,
        transaction_id: `DT-${params.bookingId}-${Date.now()}`,
        amount: params.amount,
        currency: params.currency,
        description: params.description,
        return_url: params.returnUrl,
        notify_url: params.webhookUrl,
        lang: 'FR',
        metadata: params.metadata,
      }),
    })
    
    if (!response.ok) throw new Error(`CinetPay API error: ${response.status}`)
    const data = await response.json()
    
    if (data.code !== '201') {
      return { success: false, error: data.message || 'Erreur CinetPay' }
    }
    
    return {
      success: true,
      providerRef: data.data.payment_token,
      redirectUrl: data.data.payment_url,
      message: 'Paiement CinetPay initié',
    }
  } catch (error) {
    return { success: false, error: 'Erreur CinetPay. Réessayez.' }
  }
}

// ============================================================
// FACTORY — Sélectionne l'opérateur selon la méthode
// ============================================================
export async function initiatePayment(
  operator: PaymentOperator,
  params: PaymentInitParams
): Promise<PaymentInitResult> {
  const mode = process.env.PAYMENT_MODE || 'simulated'
  
  // Force simulated in development
  if (mode === 'simulated' || process.env.NODE_ENV === 'development') {
    return initiateSimulated(params)
  }
  
  switch (operator) {
    case 'orange_money':
      return initiateOrangeMoney(params)
    case 'wave':
      return initiateWave(params)
    case 'cinetpay':
      return initiateCinetpay(params)
    default:
      return initiateSimulated(params)
  }
}

// ============================================================
// VÉRIFICATION STATUT PAIEMENT
// ============================================================
export async function checkPaymentStatus(
  operator: PaymentOperator,
  providerRef: string
): Promise<PaymentStatusResult> {
  const mode = process.env.PAYMENT_MODE || 'simulated'
  
  if (mode === 'simulated') {
    return { status: 'success', providerRef, paidAt: new Date() }
  }
  
  // En production: appel API de vérification selon l'opérateur
  return { status: 'pending', providerRef }
}

// ============================================================
// CALCUL FRAIS DE PAIEMENT
// ============================================================
export function calculatePaymentFees(
  amount: number,
  method: string,
  countryCode: string = 'ML'
): { feeAmount: number; netAmount: number } {
  // Frais approximatifs par opérateur
  const fees: Record<string, number> = {
    ORANGE_MONEY: 0.01,  // 1%
    WAVE: 0.01,          // 1%
    MOOV_MONEY: 0.015,   // 1.5%
    CARD_VISA: 0.025,    // 2.5%
    CARD_MASTERCARD: 0.025,
    CASH: 0,
    SIMULATED: 0,
  }
  
  const rate = fees[method] || 0.01
  const feeAmount = Math.round(amount * rate)
  return { feeAmount, netAmount: amount - feeAmount }
}
