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
    let userRole = 'CLIENT';
    let userFirstName = 'Utilisateur';
    let userLastName = 'Démo';
    let userId = `demo-${Date.now()}`;

    try {
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
          userRole = user.role;
          userFirstName = user.firstName;
          userLastName = user.lastName;
          userId = user.id;
        }
      }
    } catch (e) {
      console.warn('Database unreachable, skipping user verification update (using mock user)')
    }

    // Generate JWT to automatically log the user in after registration
    const { SignJWT } = await import('jose')
    const secret = new TextEncoder().encode(
      process.env.NEXTAUTH_SECRET || 'donitalan-dev-secret'
    )
    
    const token = await new SignJWT({
      userId: userId,
      role: userRole,
      phone: phone || '',
      email: email || '',
      firstName: userFirstName,
      lastName: userLastName,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret)

    const response = NextResponse.json({ success: true, message: result.message })
    
    response.cookies.set('donitalan-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Données invalides' }, { status: 400 })
    }
    console.error('OTP verify error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
