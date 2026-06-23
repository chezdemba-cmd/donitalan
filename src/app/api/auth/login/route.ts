import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const loginSchema = z.object({
  identifier: z.string().min(3),
  password: z.string().min(1),
})

const secret = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'donitalan-dev-secret'
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identifier, password } = loginSchema.parse(body)

    // Find user by phone or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { email: identifier },
        ],
      },
    })

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { success: false, error: 'Identifiants incorrects' },
        { status: 401 }
      )
    }

    if (user.status === 'BANNED' || user.status === 'DELETED') {
      return NextResponse.json(
        { success: false, error: 'Compte désactivé. Contactez le support.' },
        { status: 403 }
      )
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, error: 'Identifiants incorrects' },
        { status: 401 }
      )
    }

    // Generate JWT
    const token = await new SignJWT({
      userId: user.id,
      role: user.role,
      phone: user.phone,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret)

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      },
    })

    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        email: user.email,
        phoneVerified: user.phoneVerified,
      },
    })

    // Set HTTP-only cookie
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
      return NextResponse.json(
        { success: false, error: 'Données invalides' },
        { status: 400 }
      )
    }
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
