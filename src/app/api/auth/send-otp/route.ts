import { NextRequest, NextResponse } from 'next/server'
import { createOTP, sendOTPSms } from '@/lib/otp'
import { z } from 'zod'

const schema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  purpose: z.string().default('phone_verification'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, email, purpose } = schema.parse(body)

    if (!phone && !email) {
      return NextResponse.json({ success: false, error: 'Téléphone ou email requis' }, { status: 400 })
    }

    const otp = await createOTP({ phone, email, purpose })

    if (phone) {
      await sendOTPSms(phone, otp)
    }

    return NextResponse.json({
      success: true,
      message: 'Code OTP envoyé',
      // In dev, include the code for testing
      ...(process.env.NODE_ENV === 'development' && { devCode: otp }),
    })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ success: false, error: 'Erreur lors de l\'envoi' }, { status: 500 })
  }
}
