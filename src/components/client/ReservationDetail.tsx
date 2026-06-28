'use client'

import React from 'react'
import Link from 'next/link'
import { MapPin, Truck, ChevronLeft, CheckCircle, Clock, AlertTriangle, User } from 'lucide-react'
import { Card, Badge, Avatar } from '@/components/ui/Card'
import { BottomNav } from '@/components/shared/Navigation'
import { formatPrice, formatDate, getBookingStatusColor } from '@/lib/utils'
import { BOOKING_STATUS_LABELS } from '@/types'
import type { BookingStatus, TruckType } from '@/types'

export interface ClientReservationDetailData {
  id: string
  bookingNumber: string
  truck: { brand: string, model: string, truckType: TruckType }
  serviceType: string
  status: BookingStatus
  departureAddress: string
  arrivalAddress: string
  scheduledAt: string
  totalPrice: number
  currency: string
  startOtp: string | null
  cargoDescription: string | null
  specialRequirements: string | null
  driver: { firstName: string, lastName: string, phone: string | null, avatarUrl: string | null } | null
}

const statusIcons: Partial<Record<BookingStatus, React.ReactNode>> = {
  IN_PROGRESS: <Clock className="w-5 h-5 text-accent" />,
  PAYMENT_SECURED: <CheckCircle className="w-5 h-5 text-success" />,
  COMPLETED: <CheckCircle className="w-5 h-5 text-muted" />,
  DISPUTED: <AlertTriangle className="w-5 h-5 text-danger" />,
}

export function ReservationDetailContent({ booking }: { booking: ClientReservationDetailData }) {
  const [showOtp, setShowOtp] = React.useState(false)

  return (
    <main className="min-h-screen bg-surface pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-primary text-white pt-4 pb-12">
        <div className="container-app">
          <Link href="/reservations" className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors text-sm mb-4">
            <ChevronLeft className="w-4 h-4" />
            Retour
          </Link>
          <h1 className="text-2xl font-bold">Détails de la réservation</h1>
          <p className="text-blue-200 text-sm mt-1">N° {booking.bookingNumber}</p>
        </div>
      </div>

      <div className="container-app -mt-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Statut Card */}
            <Card className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-opacity-10 ${booking.status === 'PAYMENT_SECURED' ? 'bg-success' : 'bg-primary'}`}>
                  {statusIcons[booking.status] || <Clock className="w-6 h-6 text-primary" />}
                </div>
                <div>
                  <div className="text-sm text-muted">Statut de la mission</div>
                  <div className={`font-bold ${getBookingStatusColor(booking.status)}`}>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </div>
                </div>
              </div>
            </Card>

            {/* OTP if needed */}
            {booking.startOtp && booking.status === 'PAYMENT_SECURED' && (
              <Card className="border border-blue-200 bg-blue-50">
                <div className="flex items-center gap-3 mb-2 text-primary font-bold">
                  <ShieldIcon /> Code de démarrage (OTP)
                </div>
                <p className="text-sm text-muted mb-4">
                  Communiquez ce code au chauffeur lorsqu'il arrive sur place. Ne le donnez jamais avant.
                </p>
                {showOtp ? (
                  <div className="text-center bg-white py-3 rounded-xl border border-blue-100 mb-2">
                    <span className="font-mono text-3xl font-bold text-primary tracking-widest">{booking.startOtp}</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowOtp(true)}
                    className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary-light transition-colors"
                  >
                    Afficher le code
                  </button>
                )}
              </Card>
            )}

            {/* Informations de trajet */}
            <Card>
              <h2 className="font-bold text-text mb-4 text-lg">Informations du trajet</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-muted">Adresse de départ</div>
                    <div className="font-medium text-text">{booking.departureAddress}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-muted">Adresse d'arrivée</div>
                    <div className="font-medium text-text">{booking.arrivalAddress}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm text-muted">Date prévue</div>
                    <div className="font-medium text-text">{formatDate(booking.scheduledAt)}</div>
                  </div>
                </div>
              </div>

              {(booking.cargoDescription || booking.specialRequirements) && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <h3 className="font-semibold text-text text-sm mb-2">Détails de la charge</h3>
                  {booking.cargoDescription && <p className="text-sm text-muted mb-2">{booking.cargoDescription}</p>}
                  {booking.specialRequirements && (
                    <div className="p-3 bg-orange-50 text-accent-dark text-sm rounded-lg border border-orange-100">
                      <strong>Exigences :</strong> {booking.specialRequirements}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Camion */}
            <Card>
              <h2 className="font-bold text-text mb-4">Camion réservé</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                  🚛
                </div>
                <div>
                  <div className="font-bold text-text">{booking.truck.brand} {booking.truck.model}</div>
                  <div className="text-xs text-muted">{booking.truck.truckType.replace(/_/g, ' ')}</div>
                </div>
              </div>
            </Card>

            {/* Chauffeur */}
            {booking.driver && (
              <Card>
                <h2 className="font-bold text-text mb-4">Votre chauffeur</h2>
                <div className="flex items-center gap-3">
                  <Avatar name={`${booking.driver.firstName} ${booking.driver.lastName}`} src={booking.driver.avatarUrl || undefined} />
                  <div>
                    <div className="font-bold text-text">{booking.driver.firstName} {booking.driver.lastName}</div>
                    <a href={`tel:${booking.driver.phone}`} className="text-sm text-accent hover:underline">
                      {booking.driver.phone || 'Appeler'}
                    </a>
                  </div>
                </div>
              </Card>
            )}

            {/* Facturation */}
            <Card>
              <h2 className="font-bold text-text mb-4">Détails de paiement</h2>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Total facturé</span>
                  <span className="font-bold text-accent text-lg">{formatPrice(booking.totalPrice)}</span>
                </div>
                <div className="p-2 bg-green-50 rounded-lg text-center mt-2">
                  <span className="text-xs text-success font-semibold flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Fonds sécurisés chez DoniTalan
                  </span>
                </div>
              </div>
            </Card>

          </div>
        </div>
      </div>
      
      <BottomNav />
    </main>
  )
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  )
}
