import React from 'react'
import { Card } from '@/components/ui/Card'
import { Calendar } from 'lucide-react'

export default function AdminBookingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Réservations
        </h1>
      </div>
      <Card>
        <p className="text-muted text-center py-10">Interface de suivi des réservations et des statuts à venir.</p>
      </Card>
    </div>
  )
}
