'use client'

import React, { useState, useTransition } from 'react'
import { Card, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Truck, Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react'
import { formatPrice, formatRelativeTime, getTruckStatusColor } from '@/lib/utils'
import { validateTruck, rejectTruck } from '@/app/actions/admin'

type TruckData = {
  id: string
  brand: string
  model: string
  licensePlate: string
  type: string
  basePrice: number
  status: string
  createdAt: string
  ownerName: string
  cityName: string
}

export function AdminTrucksClient({ initialTrucks }: { initialTrucks: TruckData[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [isPending, startTransition] = useTransition()

  const handleValidate = (id: string) => {
    if (!confirm('Voulez-vous vraiment valider ce camion ?')) return
    startTransition(async () => {
      await validateTruck(id)
    })
  }

  const handleReject = (id: string) => {
    if (!confirm('Voulez-vous vraiment refuser/suspendre ce camion ?')) return
    startTransition(async () => {
      await rejectTruck(id)
    })
  }

  const filteredTrucks = initialTrucks.filter(truck => {
    const matchesSearch = 
      truck.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || truck.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" />
          Gestion des Camions
        </h1>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input 
              type="text" 
              placeholder="Rechercher (marque, modèle, plaque, proprio...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter className="w-5 h-5 text-muted shrink-0" />
            {['ALL', 'PENDING_VALIDATION', 'VALIDATED', 'SUSPENDED'].map((status) => (
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
                <th className="text-left py-3 font-semibold">Camion</th>
                <th className="text-left py-3 font-semibold">Propriétaire</th>
                <th className="text-left py-3 font-semibold">Localisation</th>
                <th className="text-right py-3 font-semibold">Prix Base</th>
                <th className="text-center py-3 font-semibold">Statut</th>
                <th className="text-right py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredTrucks.map(truck => (
                <tr key={truck.id} className={`hover:bg-slate-50 transition-colors ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                  <td className="py-4">
                    <div className="font-semibold text-text">{truck.brand} {truck.model}</div>
                    <div className="text-xs text-muted flex gap-2 mt-1">
                      <span className="bg-slate-100 px-2 py-0.5 rounded font-mono">{truck.licensePlate}</span>
                      <span>{truck.type}</span>
                    </div>
                  </td>
                  <td className="py-4 font-medium">{truck.ownerName}</td>
                  <td className="py-4 text-muted">{truck.cityName}</td>
                  <td className="py-4 text-right font-semibold">{formatPrice(truck.basePrice)}</td>
                  <td className="py-4 text-center">
                    <span className={`badge text-xs ${getTruckStatusColor(truck.status)}`}>
                      {truck.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors" title="Détails">
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                      {truck.status === 'PENDING_VALIDATION' && (
                        <>
                          <button
                            onClick={() => handleValidate(truck.id)}
                            className="p-2 rounded-lg bg-success/10 hover:bg-success text-success hover:text-white transition-colors"
                            title="Valider"
                            disabled={isPending}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(truck.id)}
                            className="p-2 rounded-lg bg-danger/10 hover:bg-danger text-danger hover:text-white transition-colors"
                            title="Refuser"
                            disabled={isPending}
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredTrucks.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Aucun camion trouvé correspondant à ces critères.</p>
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
