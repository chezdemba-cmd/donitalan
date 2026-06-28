'use client'

import React from 'react'
import Link from 'next/link'
import { Calendar, MapPin, Truck, ChevronRight, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Card, Badge, EmptyState } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/shared/Navigation'
import { formatPrice, formatDate, getBookingStatusColor } from '@/lib/utils'
import { BOOKING_STATUS_LABELS } from '@/types'
import type { BookingStatus } from '@/types'

export interface ClientBookingData {
  id: string
  bookingNumber: string
  truck: { brand: string, model: string, truckType: string }
  serviceType: string
  status: BookingStatus
  departureAddress: string
  arrivalAddress: string
  scheduledAt: string
  totalPrice: number
  currency: string
  startOtp: string | null
}

const statusIcons: Partial<Record<BookingStatus, React.ReactNode>> = {
  IN_PROGRESS: <Clock className="w-4 h-4 text-accent" />,
  PAYMENT_SECURED: <CheckCircle className="w-4 h-4 text-success" />,
  COMPLETED: <CheckCircle className="w-4 h-4 text-muted" />,
  DISPUTED: <AlertTriangle className="w-4 h-4 text-danger" />,
}

export function ReservationsContent({ initialBookings }: { initialBookings: ClientBookingData[] }) {
  const [filter, setFilter] = React.useState<'all' | 'active' | 'past'>('all')

  const filtered = initialBookings.filter(b => {
    if (filter === 'active') return ['PENDING_OWNER_ACCEPTANCE', 'ACCEPTED', 'AWAITING_PAYMENT', 'PAYMENT_SECURED', 'DRIVER_ASSIGNED', 'IN_PROGRESS', 'COMPLETED_PENDING_VALIDATION'].includes(b.status)
    if (filter === 'past') return ['COMPLETED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_OWNER', 'REFUNDED', 'CLOSED'].includes(b.status)
    return true
  })

  return (
    <main className="min-h-screen bg-surface pb-24 md:pb-8">
      <div className="bg-primary text-white py-6">
        <div className="container-app">
          <h1 className="text-2xl font-bold">Mes réservations</h1>
          <p className="text-blue-200 text-sm mt-1">Suivez vos missions en cours et passées</p>
        </div>
      </div>

      <div className="container-app py-6">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'active', label: 'En cours' },
            { key: 'past', label: 'Terminées' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                filter === tab.key
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-muted border-slate-200 hover:border-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Calendar />}
            title="Aucune réservation"
            description="Vous n'avez pas encore de réservation. Cherchez un camion pour commencer !"
            action={
              <Link href="/camions">
                <Button variant="accent">Trouver un camion</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filtered.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}

function BookingCard({ booking }: { booking: ClientBookingData }) {
  const [showOtp, setShowOtp] = React.useState(false)
  const isActive = ['IN_PROGRESS', 'PAYMENT_SECURED', 'DRIVER_ASSIGNED'].includes(booking.status)
  const isPendingValidation = booking.status === 'COMPLETED_PENDING_VALIDATION'

  return (
    <Card className={isActive ? 'border-l-4 border-l-accent' : ''}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {statusIcons[booking.status]}
            <span className={`badge text-xs ${getBookingStatusColor(booking.status)}`}>
              {BOOKING_STATUS_LABELS[booking.status]}
            </span>
          </div>
          <div className="font-bold text-text">{booking.truck.brand} {booking.truck.model}</div>
          <div className="text-xs text-muted font-mono">{booking.bookingNumber}</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-accent">{formatPrice(booking.totalPrice)}</div>
          <div className="text-xs text-muted">{formatDate(booking.scheduledAt)}</div>
        </div>
      </div>

      <div className="space-y-1.5 text-sm text-muted mb-4">
        <div className="flex items-start gap-2">
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-success" />
          <span>{booking.departureAddress}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-danger" />
          <span>{booking.arrivalAddress}</span>
        </div>
      </div>

      {/* OTP display for active bookings */}
      {booking.startOtp && booking.status === 'PAYMENT_SECURED' && (
        <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-xs text-primary font-medium mb-2">Code OTP de DÉMARRAGE à donner au chauffeur :</p>
          {showOtp ? (
            <div className="flex items-center gap-2">
              <div className="font-mono text-2xl font-bold text-primary tracking-widest">
                {booking.startOtp}
              </div>
              <button onClick={() => setShowOtp(false)} className="text-xs text-muted">Masquer</button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowOtp(true)}>
              Afficher le code OTP
            </Button>
          )}
        </div>
      )}

      {/* Validate mission button */}
      {isPendingValidation && (
        <Button variant="success" block size="sm" leftIcon={<CheckCircle className="w-4 h-4" />}>
          ✅ Valider la fin de mission
        </Button>
      )}

      <div className="flex gap-2">
        <Link href={`/reservations/${booking.id}`} className="flex-1">
          <Button variant="outline" block size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
            Voir les détails
          </Button>
        </Link>
        {isActive && (
          <Button variant="ghost" size="sm" leftIcon={<AlertTriangle className="w-4 h-4" />}>
            Litige
          </Button>
        )}
      </div>
    </Card>
  )
}
