'use client'

import React from 'react'
import Link from 'next/link'
import {
  Truck, Calendar, DollarSign, Star, Plus, Eye,
  CheckCircle, XCircle, Clock, TrendingUp, Phone,
  ArrowRight, Package
} from 'lucide-react'
import { Card, StatCard, Badge, Avatar } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/shared/Navigation'
import { formatPrice, formatDate, getBookingStatusColor } from '@/lib/utils'
import { BOOKING_STATUS_LABELS } from '@/types'

type OwnerData = {
  id: string
  firstName: string
  lastName: string
  stats: {
    thisMonthRevenue: number
    totalRevenue: number
    missionsThisMonth: number
    avgRating: string | number
    activeTrucks: number
  }
  trucks: any[]
  bookings: any[]
  payouts: any[]
}

export function OwnerDashboardContent({ initialData }: { initialData: OwnerData }) {
  const [activeTab, setActiveTab] = React.useState<'demandes' | 'camions' | 'missions' | 'revenus'>('demandes')

  const pendingRequests = initialData.bookings.filter(b => b.status === 'PENDING_OWNER_ACCEPTANCE')
  const recentMissions = initialData.bookings.filter(b => b.status !== 'PENDING_OWNER_ACCEPTANCE')

  const ownerStats = [
    { label: 'Revenus ce mois', value: formatPrice(initialData.stats.thisMonthRevenue), icon: <DollarSign className="w-5 h-5" />, color: 'text-success' },
    { label: 'Missions du mois', value: initialData.stats.missionsThisMonth.toString(), icon: <Package className="w-5 h-5" />, color: 'text-primary' },
    { label: 'Note moyenne', value: `${initialData.stats.avgRating} ★`, icon: <Star className="w-5 h-5" />, color: 'text-warning' },
    { label: 'Camions actifs', value: initialData.stats.activeTrucks.toString(), icon: <Truck className="w-5 h-5" />, color: 'text-accent' },
  ]

  const handleAccept = (bookingId: string) => {
    alert(`✅ Server Action à coder: Accepter la demande ${bookingId}`)
  }

  const handleRefuse = (bookingId: string) => {
    alert(`❌ Server Action à coder: Refuser la demande ${bookingId}`)
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-primary text-white py-6">
        <div className="container-app">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={`${initialData.firstName} ${initialData.lastName}`} size="lg" className="bg-accent" />
              <div>
                <h1 className="text-xl font-bold">Bonjour, {initialData.firstName} 👋</h1>
                <p className="text-blue-200 text-sm">Propriétaire de camions</p>
              </div>
            </div>
            <Link href="/proprietaire/ajouter-camion">
              <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Nouveau
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container-app py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ownerStats.map(stat => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-slate-100 overflow-x-auto hide-scrollbar">
          {[
            { key: 'demandes', label: `Demandes (${pendingRequests.length})` },
            { key: 'camions', label: 'Mes camions' },
            { key: 'missions', label: 'Missions' },
            { key: 'revenus', label: 'Revenus' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-muted hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Demandes */}
        {activeTab === 'demandes' && (
          <div className="space-y-4 animate-fade-in">
            {pendingRequests.length === 0 ? (
              <Card className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-muted">Aucune demande en attente</p>
              </Card>
            ) : pendingRequests.map(req => (
              <Card key={req.id} className="border-l-4 border-l-warning">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-text">{req.client}</span>
                      <Badge variant="warning">Nouvelle demande</Badge>
                    </div>
                    <div className="text-sm text-muted space-y-1">
                      <div>📍 {req.departure} → {req.arrival}</div>
                      <div>📅 {formatDate(req.scheduledAt, "dd/MM/yyyy 'à' HH:mm")}</div>
                      <div>💰 Montant : <span className="font-semibold text-text">{formatPrice(req.amount)}</span></div>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <Button
                      variant="success"
                      size="sm"
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                      onClick={() => handleAccept(req.id)}
                    >
                      Accepter
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<XCircle className="w-4 h-4" />}
                      onClick={() => handleRefuse(req.id)}
                    >
                      Refuser
                    </Button>
                    {req.phone && (
                      <a href={`tel:${req.phone}`}>
                        <Button variant="outline" size="sm" leftIcon={<Phone className="w-4 h-4" />} block>
                          Appeler
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Mes camions */}
        {activeTab === 'camions' && (
          <div className="space-y-4 animate-fade-in">
            {initialData.trucks.map(truck => (
              <Card key={truck.id} className="flex items-center gap-4">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                  🚛
                </div>
                <div className="flex-1">
                  <div className="font-bold text-text">{truck.brand} {truck.model} {truck.year}</div>
                  <div className="text-sm text-muted">{truck.truckType.replace(/_/g, ' ')}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge text-xs ${truck.status === 'VALIDATED' ? 'badge-success' : 'badge-warning'}`}>
                      {truck.status === 'VALIDATED' ? '✅ Validé' : '⏳ En attente'}
                    </span>
                    {truck.status === 'VALIDATED' && (
                      <span className="text-xs text-muted">★ {truck.averageRating} · {truck.totalTrips} missions</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Link href={`/proprietaire/camions/${truck.id}`}>
                    <Button variant="outline" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                      Voir
                    </Button>
                  </Link>
                  <div className="text-center text-sm font-semibold text-accent">
                    {formatPrice(truck.basePrice)}<span className="text-xs font-normal text-muted">/j</span>
                  </div>
                </div>
              </Card>
            ))}

            <Link href="/proprietaire/ajouter-camion">
              <Card className="border-2 border-dashed border-slate-200 hover:border-accent transition-colors cursor-pointer">
                <div className="text-center py-4">
                  <Plus className="w-8 h-8 text-muted mx-auto mb-2" />
                  <p className="font-medium text-muted">Ajouter un nouveau camion</p>
                </div>
              </Card>
            </Link>
          </div>
        )}

        {/* Tab: Missions récentes */}
        {activeTab === 'missions' && (
          <div className="space-y-3 animate-fade-in">
            {recentMissions.length === 0 ? (
              <Card className="text-center py-12">
                <p className="text-muted">Aucune mission pour le moment</p>
              </Card>
            ) : recentMissions.map(mission => (
              <Card key={mission.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-text">{mission.client}</div>
                  <div className="text-xs text-muted font-mono">{mission.number}</div>
                  <div className="text-xs text-muted">{formatDate(mission.createdAt)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-text">{formatPrice(mission.amount)}</span>
                  <span className={`badge text-xs ${getBookingStatusColor(mission.status)}`}>
                    {BOOKING_STATUS_LABELS[mission.status as keyof typeof BOOKING_STATUS_LABELS] || mission.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Revenus */}
        {activeTab === 'revenus' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center">
                <div className="text-3xl font-bold text-success">{formatPrice(initialData.stats.thisMonthRevenue)}</div>
                <div className="text-muted text-sm mt-1">Ce mois</div>
              </Card>
              <Card className="text-center">
                <div className="text-3xl font-bold text-primary">{formatPrice(initialData.stats.totalRevenue)}</div>
                <div className="text-muted text-sm mt-1">Total</div>
              </Card>
            </div>
            
            <Card>
              <h3 className="font-bold text-text mb-4">Historique des versements</h3>
              {initialData.payouts.length === 0 ? (
                <div className="text-center text-muted py-6">Aucun versement reçu pour le moment</div>
              ) : (
                <div className="space-y-3">
                  {initialData.payouts.map((payout, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                      <div>
                        <div className="font-medium text-text">{payout.method}</div>
                        <div className="text-xs text-muted">{formatDate(payout.createdAt)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-success">+{formatPrice(payout.amount)}</div>
                        <Badge variant={payout.status === 'COMPLETED' ? 'success' : 'warning'} className="text-xs">
                          {payout.status === 'COMPLETED' ? 'Versé' : 'En attente'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      <BottomNav role="TRUCK_OWNER" />
    </main>
  )
}
