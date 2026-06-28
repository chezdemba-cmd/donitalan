'use client'

import React, { useState } from 'react'
import { Card, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TrendingUp, Plus, Edit, Trash2 } from 'lucide-react'

type CommissionData = {
  id: string
  name: string
  percent: number
  serviceType: string | null
  active: boolean
  createdAt: string
}

export function AdminCommissionsClient({ initialCommissions }: { initialCommissions: CommissionData[] }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Taux de Commission
        </h1>
        <Button leftIcon={<Plus className="w-4 h-4" />}>
          Nouveau Taux
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs border-b border-slate-100 uppercase tracking-wider">
                <th className="text-left py-3 font-semibold">Nom</th>
                <th className="text-left py-3 font-semibold">Service Appliqué</th>
                <th className="text-right py-3 font-semibold">Pourcentage</th>
                <th className="text-center py-3 font-semibold">Statut</th>
                <th className="text-right py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {initialCommissions.map(comm => (
                <tr key={comm.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-semibold text-text">{comm.name}</td>
                  <td className="py-4 text-muted">
                    {comm.serviceType ? comm.serviceType.replace(/_/g, ' ') : 'Tous les services'}
                  </td>
                  <td className="py-4 text-right">
                    <span className="font-bold text-lg text-primary">{comm.percent}%</span>
                  </td>
                  <td className="py-4 text-center">
                    <Badge variant={comm.active ? 'success' : 'muted'} className="text-[10px]">
                      {comm.active ? 'ACTIF' : 'INACTIF'}
                    </Badge>
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors text-slate-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 rounded-lg hover:bg-danger/10 hover:text-danger transition-colors text-slate-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {initialCommissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Aucun taux de commission configuré.</p>
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
