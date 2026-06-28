'use client'

import React, { useState } from 'react'
import { MapPin, Phone, CheckCircle, Clock, Navigation, AlertTriangle, ShieldCheck } from 'lucide-react'
import { Card, Avatar, Badge, EmptyState } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BottomNav } from '@/components/shared/Navigation'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export interface DriverMissionData {
  id: string
  number: string
  clientName: string
  clientPhone: string
  status: string
  departure: string
  arrival: string
  truckInfo: string
  scheduledAt: string
}

export function DriverDashboardContent({ activeMission: initialMission }: { activeMission: DriverMissionData | null }) {
  const router = useRouter()
  const [activeMission, setActiveMission] = useState<DriverMissionData | null>(initialMission)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  if (!activeMission) {
    return (
      <main className="min-h-screen bg-slate-50 pb-24 md:pb-8">
        <div className="bg-primary text-white py-6">
          <div className="container-app">
            <h1 className="text-xl font-bold">Bonjour</h1>
            <p className="text-blue-200 text-sm">Chauffeur</p>
          </div>
        </div>
        <div className="container-app py-6 space-y-6">
          <EmptyState 
            title="Aucune mission active" 
            description="Vous n'avez pas de mission en cours ou en attente pour le moment." 
            icon={<CheckCircle />} 
          />
        </div>
        <BottomNav role="DRIVER" />
      </main>
    )
  }

  const handleStartMission = async () => {
    if (otp.length < 4) {
      toast.error('Veuillez entrer le code OTP donné par le client')
      return
    }
    
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${activeMission.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Mission démarrée avec succès !')
        setActiveMission({ ...activeMission, status: 'IN_PROGRESS' })
        setOtp('')
        router.refresh()
      } else {
        toast.error(data.error || 'Code OTP incorrect')
      }
    } catch (err) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleEndMission = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/bookings/${activeMission.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Mission terminée !')
        setActiveMission({ ...activeMission, status: 'COMPLETED_PENDING_VALIDATION' })
        setOtp('')
        router.refresh()
      } else {
        toast.error(data.error || 'Erreur lors de la fin de mission')
      }
    } catch (err) {
      toast.error('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const missionStatus = activeMission.status

  return (
    <main className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-primary text-white py-6">
        <div className="container-app">
          <div className="flex items-center gap-4">
            <Avatar name="Chauffeur" size="lg" className="bg-success" />
            <div>
              <h1 className="text-xl font-bold">Mission en cours</h1>
              <p className="text-blue-200 text-sm">Chauffeur · {activeMission.truckInfo}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-app py-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-text">Détails de la mission</h2>
          <Badge variant={missionStatus === 'IN_PROGRESS' ? 'success' : 'warning'}>
            {missionStatus === 'IN_PROGRESS' ? 'En cours' : 
             missionStatus === 'COMPLETED_PENDING_VALIDATION' ? 'Terminée' : 'À démarrer'}
          </Badge>
        </div>

        {missionStatus === 'COMPLETED_PENDING_VALIDATION' || missionStatus === 'COMPLETED' ? (
          <Card className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text mb-2">Excellent travail !</h3>
            <p className="text-muted">La mission est terminée. En attente d\'une nouvelle affectation.</p>
          </Card>
        ) : (
          <Card className="border-t-4 border-t-accent">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-sm text-muted font-mono mb-1">{activeMission.number}</div>
                <h3 className="font-bold text-lg text-text">{activeMission.clientName}</h3>
              </div>
              <a href={`tel:${activeMission.clientPhone}`}>
                <Button variant="outline" size="sm" leftIcon={<Phone className="w-4 h-4" />}>
                  Appeler
                </Button>
              </a>
            </div>

            <div className="relative pl-6 space-y-6 mb-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              <div className="relative">
                <div className="absolute -left-6 w-4 h-4 rounded-full border-4 border-white bg-success z-10"></div>
                <p className="text-sm font-bold text-text mb-1">Départ</p>
                <p className="text-muted text-sm">{activeMission.departure}</p>
              </div>
              <div className="relative">
                <div className="absolute -left-6 w-4 h-4 rounded-full border-4 border-white bg-danger z-10"></div>
                <p className="text-sm font-bold text-text mb-1">Arrivée</p>
                <p className="text-muted text-sm">{activeMission.arrival}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
              <div className="flex items-center gap-2 mb-3 text-sm font-medium text-text">
                <ShieldCheck className="w-5 h-5 text-primary" />
                {missionStatus === 'PAYMENT_SECURED' ? 'Validation de départ' : 'Validation d\'arrivée'}
              </div>
              <p className="text-sm text-muted mb-4">
                {missionStatus === 'PAYMENT_SECURED' 
                  ? 'Demandez au client son code OTP pour démarrer la mission.'
                  : 'Vous êtes arrivé ? Terminez la mission ici.'}
              </p>
              
              <div className="flex gap-2">
                {missionStatus === 'PAYMENT_SECURED' && (
                  <input
                    type="text"
                    placeholder="Code OTP"
                    className="input-base text-center font-mono text-xl tracking-widest flex-1"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                )}
                <Button 
                  variant={missionStatus === 'PAYMENT_SECURED' ? 'primary' : 'success'}
                  onClick={missionStatus === 'PAYMENT_SECURED' ? handleStartMission : handleEndMission}
                  disabled={loading || (missionStatus === 'PAYMENT_SECURED' && otp.length < 4)}
                  className={missionStatus === 'PAYMENT_SECURED' ? "w-32" : "w-full"}
                >
                  {loading ? '...' : (missionStatus === 'PAYMENT_SECURED' ? 'Valider' : 'Terminer la mission')}
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" block leftIcon={<Navigation className="w-4 h-4" />}>
                Itinéraire
              </Button>
              <Button variant="ghost" className="text-danger hover:bg-red-50 hover:text-danger" leftIcon={<AlertTriangle className="w-4 h-4" />}>
                Problème
              </Button>
            </div>
          </Card>
        )}
      </div>

      <BottomNav role="DRIVER" />
    </main>
  )
}
