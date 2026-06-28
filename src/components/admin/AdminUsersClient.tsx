'use client'

import React, { useState } from 'react'
import { Card, Badge } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Users, Search, Filter, Eye, Shield, CheckCircle, XCircle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

type UserData = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  role: string
  status: string
  createdAt: string
  phoneVerified: boolean
}

export function AdminUsersClient({ initialUsers }: { initialUsers: UserData[] }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL') // ALL, CLIENT, TRUCK_OWNER, DRIVER, ADMIN

  const filteredUsers = initialUsers.filter(user => {
    const matchesSearch = 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.phone && user.phone.includes(searchTerm))
    
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-700'
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-700'
      case 'TRUCK_OWNER': return 'bg-blue-100 text-blue-700'
      case 'DRIVER': return 'bg-orange-100 text-orange-700'
      case 'COMPANY': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-slate-100 text-slate-700' // CLIENT
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      case 'PENDING_VERIFICATION': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'SUSPENDED': return 'bg-red-100 text-red-700 border-red-200'
      case 'BANNED': return 'bg-zinc-800 text-white border-zinc-900'
      default: return 'bg-slate-100 text-slate-700 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          Gestion des Utilisateurs
        </h1>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input 
              type="text" 
              placeholder="Rechercher (nom, email, téléphone...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
            <Filter className="w-5 h-5 text-muted shrink-0" />
            {['ALL', 'CLIENT', 'TRUCK_OWNER', 'DRIVER', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  roleFilter === role 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {role === 'ALL' ? 'Tous' : role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted text-xs border-b border-slate-100 uppercase tracking-wider">
                <th className="text-left py-3 font-semibold">Utilisateur</th>
                <th className="text-left py-3 font-semibold">Contacts</th>
                <th className="text-left py-3 font-semibold">Rôle</th>
                <th className="text-center py-3 font-semibold">Statut</th>
                <th className="text-right py-3 font-semibold">Inscription</th>
                <th className="text-right py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4">
                    <div className="font-semibold text-text">{user.fullName}</div>
                    <div className="text-xs text-muted font-mono mt-1">ID: {user.id.slice(-6)}</div>
                  </td>
                  <td className="py-4">
                    {user.email && <div className="text-slate-600">{user.email}</div>}
                    {user.phone && <div className="text-slate-600 font-mono mt-0.5">{user.phone}</div>}
                  </td>
                  <td className="py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${getRoleColor(user.role)}`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`px-2.5 py-1 border rounded-full text-[10px] font-bold tracking-wider ${getStatusColor(user.status)}`}>
                      {user.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 text-right text-muted whitespace-nowrap">
                    {formatRelativeTime(user.createdAt)}
                  </td>
                  <td className="py-4">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 rounded-lg hover:bg-slate-200 transition-colors" title="Voir le profil">
                        <Eye className="w-4 h-4 text-slate-600" />
                      </button>
                      {user.status === 'PENDING_VERIFICATION' && (
                        <button
                          onClick={() => alert(`Server Action à coder: Valider le compte de ${user.fullName}`)}
                          className="p-2 rounded-lg bg-success/10 hover:bg-success text-success hover:text-white transition-colors"
                          title="Forcer la validation"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.status === 'ACTIVE' && (
                        <button
                          onClick={() => alert(`Server Action à coder: Suspendre le compte de ${user.fullName}`)}
                          className="p-2 rounded-lg bg-warning/10 hover:bg-warning text-warning hover:text-white transition-colors"
                          title="Suspendre"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Aucun utilisateur trouvé correspondant à ces critères.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
