import React from 'react'
import { Card } from '@/components/ui/Card'
import { Truck } from 'lucide-react'

export default function AdminCamionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" />
          Gestion des Camions
        </h1>
      </div>
      <Card>
        <p className="text-muted text-center py-10">Interface de gestion complète des camions à venir.</p>
      </Card>
    </div>
  )
}
