'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Truck, Home, Search, Calendar, User, BarChart3, Settings,
  Bell, ChevronDown, Menu, X, LogOut, Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Card'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
}

// ============================================================
// TOP NAVBAR (Desktop)
// ============================================================
interface TopNavbarProps {
  user?: {
    firstName: string
    lastName: string
    role: string
    avatarUrl?: string
  }
}

export function TopNavbar({ user }: TopNavbarProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false)

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-30">
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/accueil" className="flex items-center gap-2 font-bold text-xl">
            <img src="/logo.png" alt="DoniTalan Logo" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink href="/accueil" icon={Home} label="Accueil" />
            <NavLink href="/camions" icon={Search} label="Chercher" />
            <NavLink href="/reservations" icon={Calendar} label="Réservations" />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <UserMenu user={user} />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/connexion" className="btn btn-ghost btn-sm hidden sm:flex">
                  Connexion
                </Link>
                <Link href="/inscription" className="btn btn-accent btn-sm">
                  S'inscrire
                </Link>
              </div>
            )}
            <button
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100 py-3 animate-slide-down">
            <MobileNavLink href="/accueil" label="🏠 Accueil" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/camions" label="🔍 Rechercher un camion" onClick={() => setMobileOpen(false)} />
            <MobileNavLink href="/reservations" label="📅 Mes réservations" onClick={() => setMobileOpen(false)} />
            {!user && (
              <>
                <MobileNavLink href="/connexion" label="🔑 Connexion" onClick={() => setMobileOpen(false)} />
                <MobileNavLink href="/inscription" label="✅ S'inscrire" onClick={() => setMobileOpen(false)} />
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ElementType; label: string }) {
  const pathname = usePathname()
  const active = pathname === href || pathname?.startsWith(href + '/')
  
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors',
        active
          ? 'bg-primary bg-opacity-10 text-primary'
          : 'text-muted hover:text-text hover:bg-slate-50'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  )
}

function MobileNavLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-base font-medium text-text hover:bg-slate-50 rounded-xl transition-colors"
    >
      {label}
    </Link>
  )
}

function UserMenu({ user }: { user: { firstName: string; lastName: string; role: string; avatarUrl?: string } }) {
  const [open, setOpen] = React.useState(false)
  const fullName = `${user.firstName} ${user.lastName}`

  const getDashboardLink = () => {
    switch (user.role) {
      case 'ADMIN':
      case 'SUPER_ADMIN': return '/admin'
      case 'TRUCK_OWNER': return '/proprietaire'
      case 'DRIVER': return '/chauffeur'
      default: return '/client'
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
      >
        <Avatar src={user.avatarUrl} name={fullName} size="sm" />
        <span className="hidden sm:block text-sm font-medium text-text max-w-[100px] truncate">
          {user.firstName}
        </span>
        <ChevronDown className="w-4 h-4 text-muted" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 w-56 z-20 animate-scale-in">
            <div className="px-4 py-2 border-b border-slate-100 mb-1">
              <p className="font-semibold text-text truncate">{fullName}</p>
              <p className="text-xs text-muted capitalize">{user.role.toLowerCase().replace('_', ' ')}</p>
            </div>
            <MenuLink href={getDashboardLink()} icon={BarChart3} label="Mon tableau de bord" onClick={() => setOpen(false)} />
            <MenuLink href="/profil" icon={User} label="Mon profil" onClick={() => setOpen(false)} />
            <MenuLink href="/notifications" icon={Bell} label="Notifications" onClick={() => setOpen(false)} />
            {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
              <MenuLink href="/admin" icon={Shield} label="Administration" onClick={() => setOpen(false)} />
            )}
            <div className="border-t border-slate-100 mt-1 pt-1">
              <MenuLink href="/api/auth/signout" icon={LogOut} label="Se déconnecter" onClick={() => setOpen(false)} danger />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function MenuLink({
  href, icon: Icon, label, onClick, danger
}: {
  href: string; icon: React.ElementType; label: string; onClick: () => void; danger?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
        danger
          ? 'text-danger hover:bg-red-50'
          : 'text-text hover:bg-slate-50'
      )}
    >
      <Icon className="w-4 h-4 text-muted" />
      {label}
    </Link>
  )
}

// ============================================================
// BOTTOM MOBILE NAV (Client)
// ============================================================
const clientNavItems: NavItem[] = [
  { label: 'Accueil', href: '/accueil', icon: Home },
  { label: 'Chercher', href: '/camions', icon: Search },
  { label: 'Réservations', href: '/reservations', icon: Calendar },
  { label: 'Profil', href: '/profil', icon: User },
]

const ownerNavItems: NavItem[] = [
  { label: 'Tableau', href: '/proprietaire', icon: BarChart3 },
  { label: 'Camions', href: '/proprietaire/camions', icon: Truck },
  { label: 'Demandes', href: '/proprietaire/demandes', icon: Calendar },
  { label: 'Profil', href: '/profil', icon: User },
]

const adminNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin', icon: BarChart3 },
  { label: 'Camions', href: '/admin/camions', icon: Truck },
  { label: 'Réservations', href: '/admin/reservations', icon: Calendar },
  { label: 'Paramètres', href: '/admin/parametres', icon: Settings },
]

interface BottomNavProps {
  role?: string
}

export function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname()

  const items = role === 'TRUCK_OWNER' ? ownerNavItems
    : (role === 'ADMIN' || role === 'SUPER_ADMIN') ? adminNavItems
    : clientNavItems

  return (
    <nav className="mobile-nav md:hidden">
      <div className="flex justify-around">
        {items.map(item => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('mobile-nav-item', active && 'active')}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-danger text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// ============================================================
// PAGE HEADER
// ============================================================
interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  back?: string
}

export function PageHeader({ title, subtitle, action, back }: PageHeaderProps) {
  return (
    <div className="page-header flex items-start justify-between gap-4">
      <div>
        {back && (
          <Link href={back} className="text-muted text-sm hover:text-text flex items-center gap-1 mb-2">
            ← Retour
          </Link>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
