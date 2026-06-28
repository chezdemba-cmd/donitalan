'use client'

import React from 'react'
import Link from 'next/link'
import {
  BarChart3, Truck, Users, Calendar, AlertTriangle, TrendingUp,
  CheckCircle, XCircle, Clock, Eye, Settings, Shield,
  DollarSign, FileText, Bell
} from 'lucide-react'
import { Card, StatCard, Badge, Avatar } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatPrice, formatRelativeTime, getBookingStatusColor, getTruckStatusColor } from '@/lib/utils'

// Demo data for admin dashboard
const stats = [
  { label: 'Camions actifs', value: '48', icon: <Truck className="w-5 h-5" />, trend: { value: 12, label: 'ce mois' }, color: 'text-primary' },
  { label: 'Réservations actives', value: '23', icon: <Calendar className="w-5 h-5" />, trend: { value: 8, label: 'ce mois' }, color: 'text-accent' },
  { label: 'Utilisateurs total', value: '1 543', icon: <Users className="w-5 h-5" />, trend: { value: 23, label: 'ce mois' }, color: 'text-success' },
  { label: 'Revenus du mois', value: formatPrice(3850000), icon: <DollarSign className="w-5 h-5" />, trend: { value: 15, label: 'vs mois dernier' }, color: 'text-primary' },
]

const pendingTrucks = [
  { id: 't1', brand: 'Toyota', model: 'Land Cruiser', type: 'PICKUP', owner: 'Mamadou Keita', city: 'Bamako', submittedAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 't2', brand: 'Renault', model: 'Kangoo', type: 'CARGO_VAN', owner: 'Fatoumata Diallo', city: 'Bamako', submittedAt: new Date(Date.now() - 5 * 3600000).toISOString() },
  { id: 't3', brand: 'MAN', model: 'TGS', type: 'SEMI_TRAILER', owner: 'Seydou Coulibaly', city: 'Sikasso', submittedAt: new Date(Date.now() - 24 * 3600000).toISOString() },
]

const recentBookings = [
  { id: 'b1', number: 'DT2406ABC', client: 'Aminata Traoré', truck: 'Mercedes Actros', amount: 75000, status: 'PAYMENT_SECURED', createdAt: new Date(Date.now() - 1 * 3600000).toISOString() },
  { id: 'b2', number: 'DT2406DEF', client: 'Ibrahim Koné', truck: 'Toyota Hilux', amount: 25000, status: 'IN_PROGRESS', createdAt: new Date(Date.now() - 3 * 3600000).toISOString() },
  { id: 'b3', number: 'DT2406GHI', client: 'Kadiatou Sanogo', truck: 'Volvo FH', amount: 180000, status: 'COMPLETED', createdAt: new Date(Date.now() - 8 * 3600000).toISOString() },
  { id: 'b4', number: 'DT2406JKL', client: 'Oumar Bah', truck: 'Isuzu NMR', amount: 65000, status: 'DISPUTED', createdAt: new Date(Date.now() - 24 * 3600000).toISOString() },
]

const openDisputes = [
  { id: 'd1', booking: 'DT2406JKL', client: 'Oumar Bah', reason: 'Marchandises endommagées', amount: 65000, status: 'OPEN', createdAt: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: 'd2', booking: 'DT2405MNO', client: 'Mariam Diarra', reason: 'Retard de livraison', amount: 35000, status: 'IN_ANALYSIS', createdAt: new Date(Date.now() - 2 * 24 * 3600000).toISOString() },
]

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: BarChart3 },
  { href: '/admin/camions', label: 'Camions', icon: Truck, badge: 3 },
  { href: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
  { href: '/admin/reservations', label: 'Réservations', icon: Calendar },
  { href: '/admin/paiements', label: 'Paiements', icon: DollarSign },
  { href: '/admin/litiges', label: 'Litiges', icon: AlertTriangle, badge: 2 },
  { href: '/admin/commissions', label: 'Commissions', icon: TrendingUp },
  { href: '/admin/parametres', label: 'Paramètres', icon: Settings },
]

export function AdminDashboardContent() {
  const [activeSection, setActiveSection] = React.useState('dashboard')

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
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
                Camions en attente ({pendingTrucks.length})
              </h2>
              <Link href="/admin/camions" className="text-accent text-sm font-medium hover:underline">
                Voir tout →
              </Link>
            </div>
            <div className="space-y-3">
              {pendingTrucks.map(truck => (
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
                    <button className="p-2 rounded-lg hover:bg-white transition-colors" title="Voir">
                      <Eye className="w-4 h-4 text-muted" />
                    </button>
                    <button
                      onClick={() => alert(`Camion ${truck.id} validé !`)}
                      className="p-2 rounded-lg bg-success bg-opacity-10 hover:bg-success hover:text-white transition-colors text-success"
                      title="Valider"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => alert(`Camion ${truck.id} refusé`)}
                      className="p-2 rounded-lg bg-danger bg-opacity-10 hover:bg-danger hover:text-white transition-colors text-danger"
                      title="Refuser"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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
                  {recentBookings.map(b => (
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
                Litiges ouverts ({openDisputes.length})
              </h2>
            </div>
            <div className="space-y-3">
              {openDisputes.map(dispute => (
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
                  <Button size="sm" variant="outline" block className="mt-2">
                    Traiter le litige
                  </Button>
                </div>
              ))}
            </div>
            <Link href="/admin/litiges" className="block text-center text-accent text-sm font-medium mt-3 hover:underline">
              Voir tous les litiges →
            </Link>
          </Card>

          {/* Revenus semaine */}
          <Card>
            <h2 className="font-bold text-text mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-success" />
              Revenus cette semaine
            </h2>
            <div className="space-y-2">
              {[
                { day: 'Lun', amount: 450000 },
                { day: 'Mar', amount: 680000 },
                { day: 'Mer', amount: 520000 },
                { day: 'Jeu', amount: 790000 },
                { day: 'Ven', amount: 620000 },
                { day: 'Sam', amount: 890000 },
                { day: 'Dim', amount: 380000 },
              ].map(day => (
                <div key={day.day} className="flex items-center gap-2">
                  <span className="text-xs text-muted w-8">{day.day}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-accent rounded-full transition-all duration-500"
                      style={{ width: `${(day.amount / 890000) * 100}%` }}
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
              <span className="font-bold text-success">{formatPrice(4330000)}</span>
            </div>
          </Card>

          {/* Quick actions */}
          <Card>
            <h2 className="font-bold text-text mb-3">Actions rapides</h2>
            <div className="space-y-2">
              <Link href="/admin/camions?filter=pending">
                <Button variant="outline" block size="sm" leftIcon={<Truck className="w-4 h-4" />}>
                  Valider camions (3)
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
