'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3, Truck, Users, Calendar, AlertTriangle, TrendingUp,
  Settings, DollarSign, Bell, LogOut
} from 'lucide-react'
import { Avatar } from '@/components/ui/Card'

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

function NotificationBell() {
  const [open, setOpen] = React.useState(false)

  const notifications = [
    { id: 1, title: 'Nouveau camion à valider', time: 'Il y a 2 min', unread: true },
    { id: 2, title: 'Litige ouvert par Oumar', time: 'Il y a 1h', unread: true },
    { id: 3, title: 'Paiement de 75 000 XOF reçu', time: 'Il y a 3h', unread: false },
  ]

  return (
    <div className="relative">
      <button 
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5 text-muted" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 w-72 z-20 animate-scale-in">
            <div className="px-4 py-2 border-b border-slate-100 mb-1 flex justify-between items-center">
              <p className="font-bold text-text">Notifications</p>
              <span className="text-xs text-accent cursor-pointer hover:underline">Tout lire</span>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer ${n.unread ? 'bg-slate-50/50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${n.unread ? 'bg-accent' : 'bg-transparent'}`} />
                    <div>
                      <p className={`text-sm ${n.unread ? 'font-semibold text-text' : 'font-medium text-muted'}`}>{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-2 border-t border-slate-100 mt-1 text-center">
              <a href="/admin" className="text-sm text-accent hover:underline font-medium">Voir toutes les notifications</a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function AdminLayout({ children, title = "Tableau de bord" }: { children: React.ReactNode, title?: string }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-dark text-white fixed inset-y-0 left-0 z-20 hidden md:flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold">DoniTalan</div>
              <div className="text-xs text-slate-400">Administration</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-white bg-accent bg-opacity-20 border border-accent border-opacity-30' 
                    : 'text-slate-400 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-accent' : ''}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-danger text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Admin user */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar name="Admin DoniTalan" size="sm" className="bg-accent" />
              <div>
                <div className="text-sm font-medium">Admin Principal</div>
                <div className="text-xs text-slate-400">Super Admin</div>
              </div>
            </div>
            <a 
              href="/api/auth/signout" 
              className="p-2 rounded-lg text-slate-400 hover:text-danger hover:bg-danger hover:bg-opacity-10 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5" />
            </a>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-text">{title}</h1>
            <p className="text-muted text-sm">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="flex items-center gap-2">
              <Avatar name="Admin DoniTalan" size="sm" className="bg-accent" />
              <a href="/api/auth/signout" className="p-2 md:hidden rounded-lg hover:bg-red-50 text-danger transition-colors">
                <LogOut className="w-4 h-4" />
              </a>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
