'use client'

import React, { useState } from 'react'
import { Card, Badge } from '@/components/ui/Card'
import { DollarSign, Search, Filter, Eye } from 'lucide-react'
import { formatPrice, formatRelativeTime } from '@/lib/utils'

type PaymentData = {
  id: string
  amount: number
  platformFee: number
  ownerAmount: number
  method: string
  status: string
  bookingNumber: string
  clientName: string
  createdAt: string
}

export function AdminPaymentsClient({ initialPayments }: { initialPayments: PaymentData[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredPayments = initialPayments.filter(payment => {
    const matchesSearch = 
      payment.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'SECURED': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'RELEASED': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'PENDING': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'REFUNDED': return 'bg-zinc-100 text-zinc-700 border-zinc-200'
      case 'FAILED': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          Gestion des Paiements
        </h1>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input 
              type="text" 
              placeholder="Rechercher (N° Réservation, Client...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter className="w-5 h-5 text-muted shrink-0" />
            {['ALL', 'SECURED', 'RELEASED', 'PENDING', 'REFUNDED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  statusFilter === status 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'ALL' ? 'Tous' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs border-b border-slate-100 uppercase tracking-wider">
                <th className="text-left py-3 font-semibold">Réservation</th>
                <th className="text-left py-3 font-semibold hidden sm:table-cell">Client & Méthode</th>
                <th className="text-right py-3 font-semibold">Montant Total</th>
                <th className="text-right py-3 font-semibold">Commission</th>
                <th className="text-center py-3 font-semibold">Statut</th>
                <th className="text-right py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayments.map(payment => (
                <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="font-mono font-semibold text-text">{payment.bookingNumber}</div>
                    <div className="text-xs text-muted mt-1">{formatRelativeTime(payment.createdAt)}</div>
                  </td>
                  <td className="py-4 hidden sm:table-cell">
                    <div className="font-medium">{payment.clientName}</div>
                    <div className="text-xs text-muted mt-1">{payment.method.replace('_', ' ')}</div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="font-semibold text-slate-800">{formatPrice(payment.amount)}</div>
                    <div className="text-[10px] text-muted mt-1">Net Proprio: {formatPrice(payment.ownerAmount)}</div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="font-semibold text-success">+{formatPrice(payment.platformFee)}</div>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`px-2.5 py-1 border rounded-full text-[10px] font-bold tracking-wider ${getPaymentStatusColor(payment.status)}`}>
                      {payment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors" title="Voir les détails">
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Aucun paiement trouvé.</p>
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
