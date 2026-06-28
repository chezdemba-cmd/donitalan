'use client'

import React, { useState } from 'react'
import { Card, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AlertTriangle, Search, Filter, Eye, MessageSquare } from 'lucide-react'
import { formatPrice, formatRelativeTime } from '@/lib/utils'

type DisputeData = {
  id: string
  bookingNumber: string
  clientName: string
  reason: string
  description: string
  status: string
  amount: number
  createdAt: string
}

export function AdminDisputesClient({ initialDisputes }: { initialDisputes: DisputeData[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const filteredDisputes = initialDisputes.filter(dispute => {
    const matchesSearch = 
      dispute.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || dispute.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-danger" />
          Gestion des Litiges
        </h1>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input 
              type="text" 
              placeholder="Rechercher (N°, Client, Raison...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter className="w-5 h-5 text-muted shrink-0" />
            {['ALL', 'OPEN', 'IN_ANALYSIS', 'RESOLVED', 'PARTIAL_REFUND', 'FULL_REFUND'].map((status) => (
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
                <th className="text-left py-3 font-semibold">Litige & Motif</th>
                <th className="text-left py-3 font-semibold hidden sm:table-cell">Réservation & Client</th>
                <th className="text-right py-3 font-semibold">Montant Contesté</th>
                <th className="text-center py-3 font-semibold">Statut</th>
                <th className="text-right py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDisputes.map(dispute => (
                <tr key={dispute.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="font-semibold text-text">{dispute.reason}</div>
                    <div className="text-xs text-muted mt-1 truncate max-w-[200px]">{dispute.description}</div>
                    <div className="text-xs text-muted mt-0.5">{formatRelativeTime(dispute.createdAt)}</div>
                  </td>
                  <td className="py-4 hidden sm:table-cell">
                    <div className="font-mono text-slate-800">{dispute.bookingNumber}</div>
                    <div className="text-sm font-medium mt-1">{dispute.clientName}</div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="font-bold text-danger">{formatPrice(dispute.amount)}</div>
                  </td>
                  <td className="py-4 text-center">
                    <Badge variant={dispute.status === 'OPEN' ? 'danger' : dispute.status === 'RESOLVED' ? 'success' : 'warning'} className="text-[10px] uppercase">
                      {dispute.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg bg-accent/10 hover:bg-accent text-accent hover:text-white transition-colors" title="Messages & Médiation">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors" title="Voir les détails">
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDisputes.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Aucun litige trouvé. Ouf !</p>
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
