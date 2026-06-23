import { generateOTP } from '@/lib/utils'
import prisma from '@/lib/prisma'

// Store OTP in DB with expiry
export async function createOTP(options: {
  userId?: string
  phone?: string
  email?: string
  purpose: string
  expiresInMinutes?: number
}): Promise<string> {
  const { userId, phone, email, purpose, expiresInMinutes = 10 } = options
  const code = generateOTP(6)
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000)

  // Invalidate any existing OTPs for this phone/purpose
  if (phone) {
    await prisma.otpCode.updateMany({
      where: { phone, purpose, usedAt: null },
      data: { usedAt: new Date() },
    })
  }

  await prisma.otpCode.create({
    data: {
      userId,
      phone,
      email,
      code,
      purpose,
      expiresAt,
    },
  })

  return code
}

// Verify OTP
export async function verifyOTP(options: {
  phone?: string
  email?: string
  code: string
  purpose: string
}): Promise<{ valid: boolean; message: string }> {
  const { phone, email, code, purpose } = options

  const otpRecord = await prisma.otpCode.findFirst({
    where: {
      OR: [
        phone ? { phone } : {},
        email ? { email } : {},
      ],
      purpose,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!otpRecord) {
    return { valid: false, message: 'Code OTP invalide ou expiré' }
  }

  // Increment attempts
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { attempts: { increment: 1 } },
  })

  if (otpRecord.attempts >= 5) {
    return { valid: false, message: 'Trop de tentatives. Demandez un nouveau code.' }
  }

  if (otpRecord.code !== code) {
    return { valid: false, message: 'Code OTP incorrect' }
  }

  // Mark as used
  await prisma.otpCode.update({
    where: { id: otpRecord.id },
    data: { usedAt: new Date() },
  })

  return { valid: true, message: 'Code vérifié avec succès' }
}

// Send OTP via SMS (Africa's Talking) - Simulated in dev
export async function sendOTPSms(phone: string, otp: string): Promise<boolean> {
  const message = `Votre code DoniTalan est : ${otp}. Valable 10 minutes. Ne partagez pas ce code.`

  if (process.env.PAYMENT_MODE === 'simulated' || process.env.NODE_ENV === 'development') {
    console.log(`[SMS SIMULÉ] Envoi OTP à ${phone}: ${message}`)
    return true
  }

  try {
    // Africa's Talking integration
    const response = await fetch('https://api.africastalking.com/version1/messaging', {
      method: 'POST',
      headers: {
        'apiKey': process.env.AFRICAS_TALKING_API_KEY!,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        username: process.env.AFRICAS_TALKING_USERNAME!,
        to: phone,
        message,
        from: process.env.AFRICAS_TALKING_SENDER_ID || 'DoniTalan',
      }),
    })
    return response.ok
  } catch (error) {
    console.error('SMS send error:', error)
    return false
  }
}
