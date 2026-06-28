'use client'

import React, { useState, useTransition } from 'react'
import { Card } from '@/components/ui/Card'
import { Search, Filter, Eye, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { resolveDispute } from '@/app/actions/admin'

type DisputeData = {
  id: string
  bookingNumber: string
  clientName: string
  reason: string
  status: string
  createdAt: string
  openedBy: string
}

export function AdminDisputesClient({ initialDisputes }: { initialDisputes: DisputeData[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isPending, startTransition] = useTransition()

  const handleResolve = (id: string, resolution: 'RESOLVED' | 'PARTIAL_REFUND' | 'FULL_REFUND') => {
    let msg = 'Voulez-vous clôturer ce litige ?'
    if (resolution === 'FULL_REFUND') msg = 'Voulez-vous clôturer avec REMBOURSEMENT TOTAL ?'
    if (resolution === 'PARTIAL_REFUND') msg = 'Voulez-vous clôturer avec REMBOURSEMENT PARTIEL ?'

    if (!confirm(msg)) return
    startTransition(async () => {
      await resolveDispute(id, resolution)
    })
  }

  const filteredDisputes = initialDisputes.filter(dispute => {
    const matchesSearch = 
      dispute.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispute.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || dispute.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-700 border-red-200'
      case 'IN_ANALYSIS': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'RESOLVED': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'FULL_REFUND': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'PARTIAL_REFUND': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-primary" />
          Gestion des Litiges
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
            {['ALL', 'OPEN', 'IN_ANALYSIS', 'RESOLVED', 'FULL_REFUND'].map((status) => (
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
                <th className="text-left py-3 font-semibold">Signalé par</th>
                <th className="text-left py-3 font-semibold">Raison</th>
                <th className="text-center py-3 font-semibold">Statut</th>
                <th className="text-right py-3 font-semibold">Date</th>
                <th className="text-right py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredDisputes.map(dispute => (
                <tr key={dispute.id} className={`hover:bg-slate-50 transition-colors ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                  <td className="py-4 font-mono text-text">{dispute.bookingNumber}</td>
                  <td className="py-4">
                    <div className="font-medium">{dispute.clientName}</div>
                    <div className="text-xs text-muted mt-0.5">{dispute.openedBy}</div>
                  </td>
                  <td className="py-4">
                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium text-slate-700">
                      {dispute.reason}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`px-2.5 py-1 border rounded-full text-[10px] font-bold tracking-wider ${getStatusColor(dispute.status)}`}>
                      {dispute.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 text-right text-muted whitespace-nowrap">
                    {formatRelativeTime(dispute.createdAt)}
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors" title="Détails du litige">
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                      {(dispute.status === 'OPEN' || dispute.status === 'IN_ANALYSIS') && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleResolve(dispute.id, 'RESOLVED')}
                            className="p-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                            title="Clôturer sans remboursement"
                            disabled={isPending}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleResolve(dispute.id, 'FULL_REFUND')}
                            className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors"
                            title="Clôturer avec Remboursement"
                            disabled={isPending}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDisputes.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Aucun litige trouvé correspondant à ces critères.</p>
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
