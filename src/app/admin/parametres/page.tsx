import React from 'react'
import { Card } from '@/components/ui/Card'
import { Settings } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Paramètres
        </h1>
      </div>
      <Card>
        <p className="text-muted text-center py-10">Interface de configuration globale de la plateforme à venir.</p>
      </Card>
    </div>
  )
}
