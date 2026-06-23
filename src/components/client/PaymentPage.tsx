'use client'

import React from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Shield, CheckCircle, Loader2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatPrice } from '@/lib/utils'

const PAYMENT_METHODS = [
  { id: 'ORANGE_MONEY', name: 'Orange Money', color: '#FF6600', letter: 'O', desc: 'Paiement instantané' },
  { id: 'WAVE', name: 'Wave', color: '#1E88E5', letter: 'W', desc: 'Sans frais supplémentaires' },
  { id: 'MOOV_MONEY', name: 'Moov Money', color: '#003893', letter: 'M', desc: 'Disponible 24h/24' },
  { id: 'SAMA_MONEY', name: 'Sama Money', color: '#E31E26', letter: 'S', desc: 'Paiement mobile sécurisé' },
  { id: 'CARD_VISA', name: 'Carte Visa/Mastercard', color: '#1A1F71', letter: 'C', desc: 'Paiement par carte bancaire' },
  { id: 'SIMULATED', name: 'Paiement simulé (Test)', color: '#22C55E', letter: 'T', desc: 'Pour les tests — Mode démonstration' },
]

export function PaymentPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const amount = parseInt(searchParams.get('amount') || '50000')
  const truckId = searchParams.get('truckId') || ''

  const [selectedMethod, setSelectedMethod] = React.useState('SIMULATED')
  const [phone, setPhone] = React.useState('')
  const [processing, setProcessing] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [step, setStep] = React.useState<'select' | 'confirm' | 'processing' | 'done'>('select')

  const platformFee = Math.round(amount * 0.12)
  const ownerAmount = amount - platformFee

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error('Choisissez un mode de paiement')
      return
    }
    if (selectedMethod !== 'SIMULATED' && !phone) {
      toast.error('Entrez votre numéro de téléphone')
      return
    }

    setStep('processing')
    setProcessing(true)

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2500))

      setStep('done')
      setSuccess(true)
      toast.success('Paiement sécurisé ! Mission confirmée.')

      setTimeout(() => {
        router.push('/reservations')
      }, 3000)
    } catch {
      toast.error('Erreur de paiement. Réessayez.')
      setStep('select')
    } finally {
      setProcessing(false)
    }
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-accent bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-accent animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-text mb-2">Paiement en cours...</h2>
          <p className="text-muted">Ne fermez pas cette page</p>
          <div className="mt-4 flex gap-1 justify-center">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'done') {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="max-w-sm w-full text-center animate-scale-in">
          <div className="w-24 h-24 bg-success bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-text mb-3">Paiement confirmé !</h2>
          <p className="text-muted mb-6">
            Votre paiement de <strong>{formatPrice(amount)}</strong> est sécurisé.
            Vous recevrez un code OTP pour démarrer la mission.
          </p>
          <div className="bg-green-50 rounded-2xl p-5 mb-6 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Montant payé</span>
              <span className="font-bold text-text">{formatPrice(amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Statut</span>
              <span className="text-success font-semibold">✅ Sécurisé</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Mode</span>
              <span className="font-medium">{PAYMENT_METHODS.find(m => m.id === selectedMethod)?.name}</span>
            </div>
          </div>
          <Button variant="accent" block size="lg" onClick={() => router.push('/reservations')}>
            Voir mes réservations
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-surface py-8">
      <div className="container-app max-w-xl">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary bg-opacity-10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-text">Paiement sécurisé</h1>
          <p className="text-muted mt-1">Votre argent est protégé jusqu'à la fin de la mission</p>
        </div>

        {/* Amount summary */}
        <Card className="mb-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted">Montant réservation</span>
              <span className="font-semibold">{formatPrice(amount - platformFee)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Commission DoniTalan (12%)</span>
              <span className="font-semibold">{formatPrice(platformFee)}</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex justify-between text-lg font-bold">
              <span>Total à payer</span>
              <span className="text-accent">{formatPrice(amount)}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-primary font-medium text-center">
              🔒 Le propriétaire sera payé uniquement après votre validation de fin de mission
            </p>
          </div>
        </Card>

        {/* Payment method selection */}
        <h2 className="font-bold text-text mb-3">Choisissez votre mode de paiement</h2>
        <div className="space-y-2 mb-6">
          {PAYMENT_METHODS.map(method => (
            <button
              key={method.id}
              onClick={() => setSelectedMethod(method.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                selectedMethod === method.id
                  ? 'border-accent bg-orange-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                style={{ backgroundColor: method.color }}
              >
                {method.letter}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-text text-sm">{method.name}</div>
                <div className="text-xs text-muted">{method.desc}</div>
              </div>
              {selectedMethod === method.id && (
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Phone input for mobile money */}
        {selectedMethod && selectedMethod !== 'CARD_VISA' && selectedMethod !== 'SIMULATED' && (
          <div className="mb-6 animate-slide-up">
            <label className="label">Numéro de téléphone {selectedMethod.replace('_', ' ')}</label>
            <input
              type="tel"
              placeholder="+223 70 00 00 00"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="input-base w-full"
            />
          </div>
        )}

        {selectedMethod === 'SIMULATED' && (
          <div className="mb-6 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-sm text-yellow-700">
              🧪 <strong>Mode démonstration</strong> — Le paiement sera simulé automatiquement sans transaction réelle.
            </p>
          </div>
        )}

        <Button
          variant="accent"
          block
          size="lg"
          loading={processing}
          onClick={handlePayment}
          rightIcon={<ChevronRight className="w-5 h-5" />}
        >
          Payer {formatPrice(amount)}
        </Button>

        <p className="text-center text-xs text-muted mt-4">
          En payant, vous acceptez nos{' '}
          <a href="/cgu" className="text-accent underline">conditions générales</a>
        </p>
      </div>
    </main>
  )
}
