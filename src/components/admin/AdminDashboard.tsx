'use client'

import React from 'react'
import Link from 'next/link'
import {
  BarChart3, Truck, Users, Calendar, AlertTriangle, TrendingUp,
  CheckCircle, XCircle, Clock, Eye, Settings, Shield,
  DollarSign
} from 'lucide-react'
import { Card, StatCard, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatRelativeTime, getBookingStatusColor } from '@/lib/utils'

export interface AdminDashboardProps {
  stats: {
    activeTrucks: number
    activeBookings: number
    totalUsers: number
    monthlyRevenue: number
  }
  pendingTrucks: Array<{
    id: string
    brand: string
    model: string
    owner: string
    city: string
    submittedAt: string
  }>
  recentBookings: Array<{
    id: string
    number: string
    client: string
    truck: string
    amount: number
    status: string
  }>
  openDisputes: Array<{
    id: string
    bookingNumber: string
    client: string
    reason: string
    amount: number
    status: string
    createdAt: string
  }>
}

export function AdminDashboardContent({ data }: { data: AdminDashboardProps }) {
  const statCards = [
    { label: 'Camions actifs', value: data.stats.activeTrucks.toString(), icon: <Truck className="w-5 h-5" />, trend: { value: 12, label: 'ce mois' }, color: 'text-primary' },
    { label: 'Réservations actives', value: data.stats.activeBookings.toString(), icon: <Calendar className="w-5 h-5" />, trend: { value: 8, label: 'ce mois' }, color: 'text-accent' },
    { label: 'Utilisateurs total', value: data.stats.totalUsers.toString(), icon: <Users className="w-5 h-5" />, trend: { value: 23, label: 'ce mois' }, color: 'text-success' },
    { label: 'Revenus du mois', value: formatPrice(data.stats.monthlyRevenue), icon: <DollarSign className="w-5 h-5" />, trend: { value: 15, label: 'vs mois dernier' }, color: 'text-primary' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Camions en attente de validation */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-text flex items-center gap-2">
                <Clock className="w-5 h-5 text-warning" />
                Camions en attente ({data.pendingTrucks.length})
              </h2>
              <Link href="/admin/camions" className="text-accent text-sm font-medium hover:underline">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-3">
              {data.pendingTrucks.map(truck => (
                <div key={truck.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-warning bg-opacity-10 rounded-xl flex items-center justify-center">
                      <Truck className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <div className="font-semibold text-text text-sm">{truck.brand} {truck.model}</div>
                      <div className="text-xs text-muted">Par {truck.owner} · {truck.city}</div>
                      <div className="text-xs text-muted">{formatRelativeTime(truck.submittedAt)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/camions/${truck.id}`}>
                      <button className="p-2 rounded-lg hover:bg-white transition-colors" title="Voir détails">
                        <Eye className="w-4 h-4 text-muted" />
                      </button>
                    </Link>
                    <button
                      onClick={() => alert(`Server Action à coder: Valider le camion ${truck.id}`)}
                      className="p-2 rounded-lg bg-success bg-opacity-10 hover:bg-success hover:text-white transition-colors text-success"
                      title="Valider"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => alert(`Server Action à coder: Refuser le camion ${truck.id}`)}
                      className="p-2 rounded-lg bg-danger bg-opacity-10 hover:bg-danger hover:text-white transition-colors text-danger"
                      title="Refuser"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              {data.pendingTrucks.length === 0 && (
                <p className="text-muted text-sm text-center py-4">Aucun camion en attente de validation.</p>
              )}
            </div>
          </Card>

          {/* Réservations récentes */}
          <Card className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-text flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Réservations récentes
              </h2>
              <Link href="/admin/reservations" className="text-accent text-sm font-medium hover:underline">
                Voir tout →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted text-xs border-b border-slate-100">
                    <th className="text-left py-2 pb-3">N°</th>
                    <th className="text-left py-2 pb-3">Client</th>
                    <th className="text-left py-2 pb-3 hidden sm:table-cell">Camion</th>
                    <th className="text-right py-2 pb-3">Montant</th>
                    <th className="text-right py-2 pb-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.recentBookings.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-mono text-xs text-muted">{b.number}</td>
                      <td className="py-3 font-medium text-text">{b.client}</td>
                      <td className="py-3 text-muted hidden sm:table-cell">{b.truck}</td>
                      <td className="py-3 text-right font-semibold">{formatPrice(b.amount)}</td>
                      <td className="py-3 text-right">
                        <span className={`badge text-xs ${getBookingStatusColor(b.status)}`}>
                          {b.status.replace(/_/g, ' ').toLowerCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.recentBookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-muted text-sm">Aucune réservation récente.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Litiges ouverts */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-text flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-danger" />
                Litiges ouverts ({data.openDisputes.length})
              </h2>
            </div>
            <div className="space-y-3">
              {data.openDisputes.map(dispute => (
                <div key={dispute.id} className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-sm text-text">{dispute.client}</div>
                      <div className="text-xs text-muted">{dispute.reason}</div>
                      <div className="text-xs text-muted">{formatRelativeTime(dispute.createdAt)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-danger">{formatPrice(dispute.amount)}</div>
                      <Badge variant={dispute.status === 'OPEN' ? 'danger' : 'warning'} className="text-xs mt-1">
                        {dispute.status}
                      </Badge>
                    </div>
                  </div>
                  <Link href={`/admin/litiges/${dispute.id}`}>
                    <Button size="sm" variant="outline" block className="mt-2">
                      Traiter le litige
                    </Button>
                  </Link>
                </div>
              ))}
              {data.openDisputes.length === 0 && (
                <p className="text-muted text-sm text-center py-2">Aucun litige en cours 🎉</p>
              )}
            </div>
            {data.openDisputes.length > 0 && (
              <Link href="/admin/litiges" className="block text-center text-accent text-sm font-medium mt-3 hover:underline">
                Voir tous les litiges →
              </Link>
            )}
          </Card>

          {/* Revenus semaine */}
          <Card>
            <h2 className="font-bold text-text mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Revenus cette semaine
            </h2>
            <div className="space-y-2">
              {/* Note: Pour la V2, récupérer ces stats par jour depuis Prisma */}
              {[
                { day: 'Lun', amount: 45000 },
                { day: 'Mar', amount: 68000 },
                { day: 'Mer', amount: 52000 },
                { day: 'Jeu', amount: 79000 },
                { day: 'Ven', amount: 62000 },
                { day: 'Sam', amount: 89000 },
                { day: 'Dim', amount: 38000 },
              ].map(day => (
                <div key={day.day} className="flex items-center gap-2">
                  <span className="text-xs text-muted w-8">{day.day}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${(day.amount / 89000) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-text w-20 text-right">
                    {formatPrice(day.amount)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between">
              <span className="text-muted text-sm">Total semaine</span>
              <span className="font-bold text-success">{formatPrice(433000)}</span>
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <h2 className="font-bold text-text mb-3">Actions rapides</h2>
            <div className="space-y-2">
              <Link href="/admin/camions?filter=pending">
                <Button variant="outline" block size="sm" leftIcon={<Truck className="w-4 h-4" />}>
                  Valider camions ({data.pendingTrucks.length})
                </Button>
              </Link>
              <Link href="/admin/utilisateurs?filter=pending_kyc">
                <Button variant="outline" block size="sm" leftIcon={<Shield className="w-4 h-4" />}>
                  Valider KYC propriétaires
                </Button>
              </Link>
              <Link href="/admin/paiements?filter=pending_payout">
                <Button variant="outline" block size="sm" leftIcon={<DollarSign className="w-4 h-4" />}>
                  Déclencher virements
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
