import React from 'react'
import { Card } from '@/components/ui/Card'
import { TrendingUp } from 'lucide-react'

export default function AdminCommissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Commissions
        </h1>
      </div>
      <Card>
        <p className="text-muted text-center py-10">Interface d'analyse des revenus et commissions de la plateforme à venir.</p>
      </Card>
    </div>
  )
}
