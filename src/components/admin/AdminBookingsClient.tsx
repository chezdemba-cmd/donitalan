'use client'

import React, { useState } from 'react'
import { Card, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Calendar, Search, Filter, Eye, AlertTriangle } from 'lucide-react'
import { formatPrice, formatRelativeTime, getBookingStatusColor } from '@/lib/utils'

type BookingData = {
  id: string
  bookingNumber: string
  serviceType: string
  status: string
  clientName: string
  truckName: string
  departureCity: string | null
  arrivalCity: string | null
  totalPrice: number
  scheduledAt: string
  createdAt: string
}

export function AdminBookingsClient({ initialBookings }: { initialBookings: BookingData[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredBookings = initialBookings.filter(booking => {
    const matchesSearch = 
      booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.truckName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking.departureCity && booking.departureCity.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Gestion des Réservations
        </h1>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input 
              type="text" 
              placeholder="Rechercher (N°, client, camion, ville...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter className="w-5 h-5 text-muted shrink-0" />
            {['ALL', 'PENDING_OWNER_ACCEPTANCE', 'PAYMENT_SECURED', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'ALL' ? 'Toutes' : status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs border-b border-slate-100 uppercase tracking-wider">
                <th className="text-left py-3 font-semibold">N° Réservation</th>
                <th className="text-left py-3 font-semibold">Trajet & Service</th>
                <th className="text-left py-3 font-semibold hidden sm:table-cell">Client / Camion</th>
                <th className="text-right py-3 font-semibold">Montant</th>
                <th className="text-center py-3 font-semibold">Statut</th>
                <th className="text-right py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="font-mono font-semibold text-text">{booking.bookingNumber}</div>
                    <div className="text-xs text-muted mt-1">{formatRelativeTime(booking.createdAt)}</div>
                  </td>
                  <td className="py-4">
                    <div className="font-medium text-slate-800">
                      {booking.departureCity || 'Départ'} → {booking.arrivalCity || 'Arrivée'}
                    </div>
                    <div className="text-xs text-muted mt-1">{booking.serviceType.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-primary mt-0.5">Prévu: {new Date(booking.scheduledAt).toLocaleDateString('fr-FR')}</div>
                  </td>
                  <td className="py-4 hidden sm:table-cell">
                    <div className="font-medium">{booking.clientName}</div>
                    <div className="text-xs text-muted mt-1 flex items-center gap-1">
                      {booking.truckName}
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="font-semibold">{formatPrice(booking.totalPrice)}</div>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`badge text-[10px] uppercase tracking-wider ${getBookingStatusColor(booking.status)}`}>
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors" title="Voir les détails">
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                      {booking.status === 'DISPUTED' && (
                        <button
                          onClick={() => alert(`Server Action à coder: Gérer le litige pour ${booking.bookingNumber}`)}
                          className="p-2 rounded-lg bg-danger/10 hover:bg-danger text-danger hover:text-white transition-colors"
                          title="Gérer le litige"
                        >
                          <AlertTriangle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Aucune réservation trouvée pour ces critères.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
