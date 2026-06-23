import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyOTP } from '@/lib/otp'
import { z } from 'zod'

const schema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  code: z.string().length(6),
  purpose: z.string().default('phone_verification'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, email, code, purpose } = schema.parse(body)

    const result = await verifyOTP({ phone, email, code, purpose })

    if (!result.valid) {
      return NextResponse.json({ success: false, error: result.message }, { status: 400 })
    }

    // Mark user phone/email as verified
    if (phone) {
      const user = await prisma.user.findFirst({ where: { phone } })
      if (user) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            phoneVerified: true,
            status: 'ACTIVE',
          },
        })
      }
    }

    return NextResponse.json({ success: true, message: result.message })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 })
    }
    console.error('OTP verify error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
