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
import { formatPrice, formatDate, getBookingStatusColor, BOOKING_STATUS_LABELS } from '@/lib/utils'
import type { BookingStatus } from '@/types'

const ownerStats = [
  { label: 'Revenus ce mois', value: formatPrice(850000), icon: <DollarSign className="w-5 h-5" />, trend: { value: 18, label: 'vs mois dernier' }, color: 'text-success' },
  { label: 'Missions réalisées', value: '23', icon: <Package className="w-5 h-5" />, trend: { value: 5, label: 'ce mois' }, color: 'text-primary' },
  { label: 'Note moyenne', value: '4.8 ★', icon: <Star className="w-5 h-5" />, color: 'text-warning' },
  { label: 'Camions actifs', value: '2', icon: <Truck className="w-5 h-5" />, color: 'text-accent' },
]

const myTrucks = [
  {
    id: 'truck-1', brand: 'Mercedes', model: 'Actros', year: 2019,
    truckType: 'TARPAULIN', status: 'VALIDATED',
    averageRating: 4.8, totalTrips: 87,
    basePrice: 45000,
  },
  {
    id: 'truck-2', brand: 'Toyota', model: 'Hilux', year: 2021,
    truckType: 'PICKUP', status: 'PENDING_VALIDATION',
    averageRating: 0, totalTrips: 0,
    basePrice: 15000,
  },
]

const pendingRequests = [
  {
    id: 'b1', number: 'DT2406ABC',
    client: 'Aminata Traoré', phone: '+22376000001',
    departure: 'Badalabougou', arrival: 'ACI 2000',
    scheduledAt: new Date(Date.now() + 2 * 3600000).toISOString(),
    amount: 75000, status: 'PENDING_OWNER_ACCEPTANCE' as BookingStatus,
  },
  {
    id: 'b2', number: 'DT2406DEF',
    client: 'Ibrahim Koné', phone: '+22377000002',
    departure: 'Lafiabougou', arrival: 'Kalaban-Coro',
    scheduledAt: new Date(Date.now() + 24 * 3600000).toISOString(),
    amount: 35000, status: 'PENDING_OWNER_ACCEPTANCE' as BookingStatus,
  },
]

const recentMissions = [
  { id: 'b3', number: 'DT2406GHI', client: 'Kadiatou Sanogo', amount: 65000, status: 'IN_PROGRESS' as BookingStatus, date: new Date().toISOString() },
  { id: 'b4', number: 'DT2406JKL', client: 'Oumar Bah', amount: 45000, status: 'COMPLETED' as BookingStatus, date: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'b5', number: 'DT2406MNO', client: 'Mariam Diarra', amount: 30000, status: 'COMPLETED' as BookingStatus, date: new Date(Date.now() - 48 * 3600000).toISOString() },
]

export function OwnerDashboardContent() {
  const [activeTab, setActiveTab] = React.useState<'demandes' | 'camions' | 'missions' | 'revenus'>('demandes')

  const handleAccept = (bookingId: string) => {
    alert(`✅ Demande ${bookingId} acceptée ! Le client sera notifié.`)
  }

  const handleRefuse = (bookingId: string) => {
    alert(`❌ Demande ${bookingId} refusée.`)
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-primary text-white py-6">
        <div className="container-app">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar name="Moussa Diarra" size="lg" className="bg-accent" />
              <div>
                <h1 className="text-xl font-bold">Bonjour, Moussa 👋</h1>
                <p className="text-blue-200 text-sm">Propriétaire certifié · Bamako</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-warning text-sm">★ 4.8</span>
                  <span className="text-blue-200 text-xs">· 87 missions</span>
                </div>
              </div>
            </div>
            <Link href="/proprietaire/ajouter-camion">
              <Button variant="accent" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Ajouter camion
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
        <div className="flex gap-1 bg-white rounded-2xl p-1 shadow-sm border border-slate-100">
          {[
            { key: 'demandes', label: `Demandes (${pendingRequests.length})` },
            { key: 'camions', label: 'Mes camions' },
            { key: 'missions', label: 'Missions' },
            { key: 'revenus', label: 'Revenus' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
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
                    <a href={`tel:${req.phone}`}>
                      <Button variant="outline" size="sm" leftIcon={<Phone className="w-4 h-4" />} block>
                        Appeler
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Tab: Mes camions */}
        {activeTab === 'camions' && (
          <div className="space-y-4 animate-fade-in">
            {myTrucks.map(truck => (
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
            {recentMissions.map(mission => (
              <Card key={mission.id} className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-text">{mission.client}</div>
                  <div className="text-xs text-muted font-mono">{mission.number}</div>
                  <div className="text-xs text-muted">{formatDate(mission.date)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-text">{formatPrice(mission.amount)}</span>
                  <span className={`badge text-xs ${getBookingStatusColor(mission.status)}`}>
                    {BOOKING_STATUS_LABELS[mission.status]}
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
                <div className="text-3xl font-bold text-success">{formatPrice(850000)}</div>
                <div className="text-muted text-sm mt-1">Ce mois</div>
              </Card>
              <Card className="text-center">
                <div className="text-3xl font-bold text-primary">{formatPrice(4200000)}</div>
                <div className="text-muted text-sm mt-1">Total 2024</div>
              </Card>
            </div>
            <Card>
              <h3 className="font-bold text-text mb-4">Virements reçus</h3>
              <div className="space-y-3">
                {[
                  { date: '20 juin 2024', amount: 280000, method: 'Orange Money', status: 'COMPLETED' },
                  { date: '15 juin 2024', amount: 195000, method: 'Wave', status: 'COMPLETED' },
                  { date: '10 juin 2024', amount: 375000, method: 'Orange Money', status: 'COMPLETED' },
                ].map((payout, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0">
                    <div>
                      <div className="font-medium text-text">{payout.method}</div>
                      <div className="text-xs text-muted">{payout.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-success">+{formatPrice(payout.amount)}</div>
                      <Badge variant="success" className="text-xs">Reçu</Badge>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-xl text-center text-xs text-primary font-medium">
                💳 Prochain virement estimé : {formatPrice(285000)} · dans 3 jours
              </div>
            </Card>
          </div>
        )}
      </div>

      <BottomNav role="TRUCK_OWNER" />
    </main>
  )
}
