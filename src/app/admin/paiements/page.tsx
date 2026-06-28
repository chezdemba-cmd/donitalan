import React from 'react'
import { Card } from '@/components/ui/Card'
import { DollarSign } from 'lucide-react'

export default function AdminPaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-primary" />
          Paiements
        </h1>
      </div>
      <Card>
        <p className="text-muted text-center py-10">Interface de gestion des paiements et décaissements à venir.</p>
      </Card>
    </div>
  )
}
