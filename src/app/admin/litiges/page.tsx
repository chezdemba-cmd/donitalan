import React from 'react'
import { Card } from '@/components/ui/Card'
import { AlertTriangle } from 'lucide-react'

export default function AdminDisputesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-primary" />
          Litiges
        </h1>
      </div>
      <Card>
        <p className="text-muted text-center py-10">Interface de traitement des litiges (réclamations, retards, casses) à venir.</p>
      </Card>
    </div>
  )
}
