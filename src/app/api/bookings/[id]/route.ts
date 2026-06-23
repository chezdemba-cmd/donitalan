import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { createOTP, sendOTPSms } from '@/lib/otp'
import { initiatePayment } from '@/lib/payment'
import { z } from 'zod'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        truck: {
          include: {
            city: true,
            owner: { include: { user: { select: { firstName: true, lastName: true, phone: true, avatarUrl: true } } } },
          },
        },
        client: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        driver: { include: { user: { select: { firstName: true, lastName: true, phone: true } } } },
        payment: true,
        dispute: true,
        reviews: { include: { author: { select: { firstName: true, lastName: true } } } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        messages: {
          include: { sender: { select: { firstName: true, lastName: true, avatarUrl: true } } },
          orderBy: { createdAt: 'asc' },
          take: 50,
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Réservation non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: booking })
  } catch (error) {
    console.error('Booking GET error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}

const actionSchema = z.object({
  action: z.enum([
    'accept', 'refuse', 'pay', 'start_mission', 'complete_mission',
    'validate_completion', 'open_dispute', 'cancel',
  ]),
  // For payment
  paymentMethod: z.string().optional(),
  paymentPhone: z.string().optional(),
  // For OTP actions
  otp: z.string().length(6).optional(),
  // For dispute/cancel
  reason: z.string().optional(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ success: false, error: 'Non authentifié' }, { status: 401 })

    const body = await request.json()
    const { action, paymentMethod, paymentPhone, otp, reason } = actionSchema.parse(body)

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        truck: { include: { owner: { include: { user: true } } } },
        client: { include: { user: true } },
        payment: true,
      },
    })

    if (!booking) {
      return NextResponse.json({ success: false, error: 'Réservation non trouvée' }, { status: 404 })
    }

    switch (action) {
      // ---- OWNER: Accept booking ----
      case 'accept': {
        const owner = await prisma.truckOwner.findUnique({ where: { userId } })
        if (!owner || booking.truck.ownerId !== owner.id) {
          return NextResponse.json({ success: false, error: 'Accès refusé' }, { status: 403 })
        }

        const updated = await prisma.booking.update({
          where: { id: params.id },
          data: {
            status: 'AWAITING_PAYMENT',
            statusHistory: { create: { status: 'AWAITING_PAYMENT', changedBy: userId, note: 'Demande acceptée par le propriétaire' } },
          },
        })

        // Notify client
        if (booking.client) {
          await prisma.notification.create({
            data: {
              userId: booking.client.userId,
              type: 'BOOKING_CONFIRMED',
              title: 'Demande acceptée !',
              body: `Votre réservation ${booking.bookingNumber} a été acceptée. Procédez au paiement.`,
              data: { bookingId: booking.id },
              channels: ['IN_APP', 'SMS'],
            },
          })
        }

        return NextResponse.json({ success: true, data: updated })
      }

      // ---- OWNER: Refuse booking ----
      case 'refuse': {
        const updated = await prisma.booking.update({
          where: { id: params.id },
          data: {
            status: 'CANCELLED_BY_OWNER',
            cancelReason: reason,
            statusHistory: { create: { status: 'CANCELLED_BY_OWNER', changedBy: userId, note: reason || 'Refusé par le propriétaire' } },
          },
        })
        return NextResponse.json({ success: true, data: updated })
      }

      // ---- CLIENT: Pay ----
      case 'pay': {
        if (booking.status !== 'AWAITING_PAYMENT') {
          return NextResponse.json({ success: false, error: 'Statut incorrect pour paiement' }, { status: 400 })
        }

        const payResult = await initiatePayment(
          (paymentMethod as 'simulated') || 'simulated',
          {
            amount: booking.totalPrice.toNumber(),
            currency: booking.currency,
            phone: paymentPhone,
            description: `DoniTalan - Réservation ${booking.bookingNumber}`,
            bookingId: booking.id,
            returnUrl: `${process.env.APP_URL}/reservations/${booking.id}?payment=done`,
            webhookUrl: `${process.env.APP_URL}/api/webhooks/payment`,
          }
        )

        if (!payResult.success) {
          return NextResponse.json({ success: false, error: payResult.error }, { status: 400 })
        }

        // Create/update payment record
        await prisma.payment.upsert({
          where: { bookingId: booking.id },
          create: {
            bookingId: booking.id,
            amount: booking.totalPrice,
            currency: booking.currency,
            method: (paymentMethod || 'SIMULATED') as never,
            provider: paymentMethod || 'simulated',
            providerRef: payResult.providerRef,
            status: 'SECURED',
            platformFee: booking.platformFee,
            ownerAmount: booking.totalPrice.minus(booking.platformFee),
            paidAt: new Date(),
          },
          update: {
            status: 'SECURED',
            providerRef: payResult.providerRef,
            paidAt: new Date(),
          },
        })

        // Generate start OTP and send to client
        const startOtp = await createOTP({
          userId,
          phone: booking.client?.user.phone || undefined,
          purpose: `mission_start_${booking.id}`,
          expiresInMinutes: 24 * 60,
        })

        await prisma.booking.update({
          where: { id: params.id },
          data: {
            status: 'PAYMENT_SECURED',
            startOtp,
            statusHistory: {
              create: {
                status: 'PAYMENT_SECURED',
                changedBy: userId,
                note: `Paiement sécurisé via ${paymentMethod || 'simulé'}`,
              },
            },
          },
        })

        // Send OTP to client
        if (booking.client?.user.phone) {
          await sendOTPSms(
            booking.client.user.phone,
            startOtp
          )
        }

        return NextResponse.json({
          success: true,
          message: 'Paiement sécurisé. Code OTP de démarrage envoyé.',
          data: { bookingId: booking.id, redirectUrl: payResult.redirectUrl },
        })
      }

      // ---- DRIVER: Start mission with OTP ----
      case 'start_mission': {
        if (booking.status !== 'PAYMENT_SECURED' && booking.status !== 'DRIVER_ASSIGNED') {
          return NextResponse.json({ success: false, error: 'Impossible de démarrer cette mission' }, { status: 400 })
        }

        if (!otp || otp !== booking.startOtp) {
          return NextResponse.json({ success: false, error: 'Code OTP de démarrage incorrect' }, { status: 400 })
        }

        // Generate end OTP
        const endOtp = await createOTP({
          userId,
          phone: booking.client?.user.phone || undefined,
          purpose: `mission_end_${booking.id}`,
          expiresInMinutes: 48 * 60,
        })

        await prisma.booking.update({
          where: { id: params.id },
          data: {
            status: 'IN_PROGRESS',
            startOtpUsed: true,
            startOtpUsedAt: new Date(),
            startedAt: new Date(),
            endOtp,
            statusHistory: { create: { status: 'IN_PROGRESS', changedBy: userId, note: 'Mission démarrée avec OTP' } },
          },
        })

        // Send end OTP to client
        if (booking.client?.user.phone) {
          await sendOTPSms(
            booking.client.user.phone,
            `Votre code DoniTalan de FIN de mission est : ${endOtp}. Donnez-le au chauffeur à l'arrivée.`
          )
        }

        return NextResponse.json({ success: true, message: 'Mission démarrée !' })
      }

      // ---- DRIVER: Complete mission with OTP ----
      case 'complete_mission': {
        if (booking.status !== 'IN_PROGRESS') {
          return NextResponse.json({ success: false, error: 'Mission non en cours' }, { status: 400 })
        }

        if (!otp || otp !== booking.endOtp) {
          return NextResponse.json({ success: false, error: 'Code OTP de fin incorrect' }, { status: 400 })
        }

        await prisma.booking.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED_PENDING_VALIDATION',
            endOtpUsed: true,
            endOtpUsedAt: new Date(),
            completedAt: new Date(),
            statusHistory: {
              create: {
                status: 'COMPLETED_PENDING_VALIDATION',
                changedBy: userId,
                note: 'Mission terminée, en attente validation client',
              },
            },
          },
        })

        return NextResponse.json({ success: true, message: 'Mission marquée comme terminée. En attente de validation client.' })
      }

      // ---- CLIENT: Validate completion & release payment ----
      case 'validate_completion': {
        if (booking.status !== 'COMPLETED_PENDING_VALIDATION') {
          return NextResponse.json({ success: false, error: 'Statut incorrect' }, { status: 400 })
        }

        // Release payment to owner
        if (booking.payment) {
          await prisma.payment.update({
            where: { bookingId: booking.id },
            data: { status: 'RELEASED', releasedAt: new Date() },
          })

          // Create payout for owner
          const owner = await prisma.truckOwner.findUnique({ where: { id: booking.truck.ownerId } })
          if (owner) {
            await prisma.payout.create({
              data: {
                ownerId: owner.id,
                paymentId: booking.payment.id,
                amount: booking.payment.ownerAmount,
                currency: booking.currency,
                method: booking.payment.method,
                status: 'PENDING',
              },
            })

            // Update owner earnings
            await prisma.truckOwner.update({
              where: { id: owner.id },
              data: { totalEarnings: { increment: booking.payment.ownerAmount } },
            })
          }
        }

        await prisma.booking.update({
          where: { id: params.id },
          data: {
            status: 'COMPLETED',
            statusHistory: {
              create: {
                status: 'COMPLETED',
                changedBy: userId,
                note: 'Mission validée par le client. Paiement libéré.',
              },
            },
          },
        })

        // Update truck stats
        await prisma.truck.update({
          where: { id: booking.truckId },
          data: { totalTrips: { increment: 1 } },
        })

        return NextResponse.json({ success: true, message: 'Mission validée ! Paiement libéré au propriétaire.' })
      }

      // ---- CLIENT: Open dispute ----
      case 'open_dispute': {
        if (!reason) return NextResponse.json({ success: false, error: 'Motif requis' }, { status: 400 })

        await prisma.$transaction([
          prisma.booking.update({
            where: { id: params.id },
            data: {
              status: 'DISPUTED',
              statusHistory: { create: { status: 'DISPUTED', changedBy: userId, note: reason } },
            },
          }),
          prisma.dispute.create({
            data: {
              bookingId: booking.id,
              openedById: userId,
              clientId: booking.clientId,
              reason: 'Litige client',
              description: reason,
              status: 'OPEN',
            },
          }),
        ])

        if (booking.payment) {
          await prisma.payment.update({
            where: { bookingId: booking.id },
            data: { status: 'DISPUTED' },
          })
        }

        return NextResponse.json({ success: true, message: 'Litige ouvert. Notre équipe vous contactera sous 24h.' })
      }

      default:
        return NextResponse.json({ success: false, error: 'Action invalide' }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Données invalides', details: error.errors }, { status: 400 })
    }
    console.error('Booking action error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
