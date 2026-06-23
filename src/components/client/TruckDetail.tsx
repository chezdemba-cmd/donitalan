'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import {
  MapPin, Star, Truck, Calendar, Clock, Package,
  Phone, ChevronLeft, CheckCircle, Shield, Users, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, Badge, Rating, Modal, Avatar } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { BottomNav } from '@/components/shared/Navigation'
import { TRUCK_TYPE_LABELS, SERVICE_TYPE_LABELS, type TruckType, type ServiceType } from '@/types'
import { formatPrice, calculatePrice } from '@/lib/utils'

// Demo truck data
const getDemoTruck = (id: string) => ({
  id,
  brand: 'Mercedes', model: 'Actros', year: 2019,
  licensePlate: 'BK-2019-A',
  truckType: 'TARPAULIN' as TruckType,
  capacityTons: 20, volumeM3: 80,
  basePrice: 45000, pricePerKm: 200, pricePerHour: 5000,
  currency: 'XOF',
  withDriver: true,
  photoUrls: [],
  averageRating: 4.8, totalTrips: 87,
  city: { name: 'Bamako', country: { name: 'Mali', flag: '🇲🇱' } },
  zones: ['Bamako', 'Ségou', 'Kayes', 'Sikasso'],
  description: 'Camion bâché Mercedes Actros en excellent état, régulièrement entretenu. Chauffeur professionnel avec 10 ans d\'expérience. Disponible 7j/7, possibilité de missions urgentes. Livraison dans toute la région de Bamako et grandes villes du Mali.',
  owner: {
    id: 'owner-1',
    user: { firstName: 'Moussa', lastName: 'Diarra', avatarUrl: undefined, phone: '+22370000001' },
    kycStatus: 'VERIFIED',
    totalEarnings: 2800000,
  },
  documents: [
    { docType: 'CARTE_GRISE', verified: true },
    { docType: 'ASSURANCE', verified: true },
    { docType: 'VISITE_TECHNIQUE', verified: true },
    { docType: 'PERMIS_CHAUFFEUR', verified: true },
  ],
  reviews: [
    { id: 'r1', rating: 5, comment: 'Parfait ! Très professionnel, ponctuel.', createdAt: '2024-05-15', author: { firstName: 'Kadiatou', lastName: 'Traoré', avatarUrl: undefined } },
    { id: 'r2', rating: 5, comment: 'Excellent service, camion propre et en bon état.', createdAt: '2024-05-10', author: { firstName: 'Ibrahim', lastName: 'Koné', avatarUrl: undefined } },
    { id: 'r3', rating: 4, comment: 'Bon service, léger retard mais très professionnel.', createdAt: '2024-04-28', author: { firstName: 'Aminata', lastName: 'Diallo', avatarUrl: undefined } },
  ],
})

interface BookingFormData {
  serviceType: ServiceType
  departureAddress: string
  arrivalAddress: string
  scheduledAt: string
  estimatedDistKm: number
  nbHandlers: number
  cargoDescription: string
  specialRequirements: string
  isUrgent: boolean
}

export function TruckDetailPage({ truckId }: { truckId: string }) {
  const router = useRouter()
  const truck = getDemoTruck(truckId)
  const [showBookingModal, setShowBookingModal] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [formData, setFormData] = React.useState<BookingFormData>({
    serviceType: 'MOVING_RESIDENTIAL',
    departureAddress: '',
    arrivalAddress: '',
    scheduledAt: '',
    estimatedDistKm: 10,
    nbHandlers: 0,
    cargoDescription: '',
    specialRequirements: '',
    isUrgent: false,
  })

  const pricing = calculatePrice({
    basePrice: truck.basePrice,
    distanceKm: formData.estimatedDistKm,
    pricePerKm: truck.pricePerKm,
    nbHandlers: formData.nbHandlers,
    isUrgent: formData.isUrgent,
    commissionPercent: 12,
  })

  const handleBooking = async () => {
    if (!formData.departureAddress || !formData.arrivalAddress || !formData.scheduledAt) {
      toast.error('Complétez tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      // In MVP, redirect to payment page
      toast.success('Réservation créée ! Procédez au paiement.')
      setShowBookingModal(false)
      router.push(`/paiement?truckId=${truckId}&amount=${pricing.totalPrice}`)
    } catch {
      toast.error('Erreur. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="pb-24 md:pb-8 bg-surface min-h-screen">
      {/* Back */}
      <div className="container-app py-4">
        <Link href="/camions" className="flex items-center gap-1 text-muted hover:text-text transition-colors text-sm">
          <ChevronLeft className="w-4 h-4" />
          Retour aux camions
        </Link>
      </div>

      {/* Photos */}
      <div className="container-app mb-6">
        <div className="h-56 sm:h-72 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center relative overflow-hidden">
          <span className="text-8xl">🚛</span>
          <div className="absolute top-4 left-4">
            <Badge variant="success" dot>Disponible</Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge variant="warning">✅ Vérifié</Badge>
          </div>
        </div>
      </div>

      <div className="container-app grid lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">

          {/* Title */}
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-text">{truck.brand} {truck.model} {truck.year}</h1>
                <p className="text-muted">{TRUCK_TYPE_LABELS[truck.truckType]}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-accent">{formatPrice(truck.basePrice)}</div>
                <div className="text-sm text-muted">par jour</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge badge-primary">{truck.capacityTons}t</span>
              <span className="badge badge-primary">{truck.volumeM3}m³</span>
              {truck.withDriver && <span className="badge badge-success">Avec chauffeur</span>}
              {truck.pricePerKm && <span className="badge badge-muted">{truck.pricePerKm} FCFA/km</span>}
            </div>

            <div className="flex items-center gap-4 text-sm text-muted">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-warning fill-warning" />
                <span className="font-semibold text-text">{truck.averageRating}</span>
                <span>({truck.totalTrips} missions)</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {truck.city.name}, {truck.city.country.name}
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card>
            <h2 className="font-bold text-text mb-3">À propos de ce camion</h2>
            <p className="text-muted leading-relaxed">{truck.description}</p>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <h3 className="font-semibold text-text text-sm mb-2">Zones desservies</h3>
              <div className="flex flex-wrap gap-2">
                {truck.zones.map(zone => (
                  <span key={zone} className="badge badge-muted">{zone}</span>
                ))}
              </div>
            </div>
          </Card>

          {/* Documents vérifiés */}
          <Card>
            <h2 className="font-bold text-text mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-success" />
              Documents vérifiés par DoniTalan
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {truck.documents.map(doc => (
                <div key={doc.docType} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-text">
                    {doc.docType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Propriétaire */}
          <Card>
            <h2 className="font-bold text-text mb-4">Le propriétaire</h2>
            <div className="flex items-center gap-4">
              <Avatar name={`${truck.owner.user.firstName} ${truck.owner.user.lastName}`} size="lg" />
              <div className="flex-1">
                <div className="font-bold text-text">
                  {truck.owner.user.firstName} {truck.owner.user.lastName}
                </div>
                <div className="text-sm text-muted">{truck.totalTrips} missions réalisées</div>
                <div className="mt-1">
                  <Badge variant={truck.owner.kycStatus === 'VERIFIED' ? 'success' : 'warning'} dot>
                    {truck.owner.kycStatus === 'VERIFIED' ? 'Identité vérifiée' : 'En cours de vérification'}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Avis */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-text">Avis clients</h2>
              <div className="flex items-center gap-2">
                <Rating value={truck.averageRating} size="sm" />
                <span className="font-bold text-text">{truck.averageRating}</span>
                <span className="text-muted text-sm">({truck.reviews.length} avis)</span>
              </div>
            </div>
            <div className="space-y-4">
              {truck.reviews.map(review => (
                <div key={review.id} className="flex gap-3">
                  <Avatar name={`${review.author.firstName} ${review.author.lastName}`} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-text">
                        {review.author.firstName} {review.author.lastName.charAt(0)}.
                      </span>
                      <Rating value={review.rating} size="sm" />
                    </div>
                    <p className="text-sm text-muted">{review.comment}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Booking sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-20">
            <h2 className="font-bold text-text mb-4">Réserver ce camion</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted">Prix de base</span>
                <span className="font-medium">{formatPrice(truck.basePrice)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Transport (~10km)</span>
                <span className="font-medium">{formatPrice(truck.pricePerKm! * 10)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted">Commission plateforme (12%)</span>
                <span className="font-medium">{formatPrice(pricing.platformFee)}</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between font-bold">
                <span>Total estimé</span>
                <span className="text-accent">{formatPrice(pricing.totalPrice)}</span>
              </div>
            </div>

            <Button
              variant="accent"
              block
              size="lg"
              onClick={() => setShowBookingModal(true)}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              Réserver maintenant
            </Button>

            <div className="mt-3 pt-3 border-t border-slate-100">
              <a
                href={`tel:${truck.owner.user.phone}`}
                className="flex items-center justify-center gap-2 text-sm text-muted hover:text-text transition-colors"
              >
                <Phone className="w-4 h-4" />
                Appeler le propriétaire
              </a>
            </div>

            <div className="mt-4 p-3 bg-green-50 rounded-xl text-center">
              <p className="text-xs text-green-700 font-medium">
                🔒 Paiement 100% sécurisé via séquestre DoniTalan
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Détails de la réservation"
        size="lg"
      >
        <div className="space-y-4">
          <Select
            label="Type de service"
            value={formData.serviceType}
            onChange={e => setFormData(d => ({ ...d, serviceType: e.target.value as ServiceType }))}
            options={Object.entries(SERVICE_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
          />
          <Input
            label="Adresse de départ *"
            placeholder="Ex: Quartier Badalabougou, Bamako"
            leftIcon={<MapPin className="w-4 h-4" />}
            value={formData.departureAddress}
            onChange={e => setFormData(d => ({ ...d, departureAddress: e.target.value }))}
          />
          <Input
            label="Adresse d'arrivée *"
            placeholder="Ex: ACI 2000, Bamako"
            leftIcon={<MapPin className="w-4 h-4" />}
            value={formData.arrivalAddress}
            onChange={e => setFormData(d => ({ ...d, arrivalAddress: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Date et heure *"
              type="datetime-local"
              leftIcon={<Calendar className="w-4 h-4" />}
              value={formData.scheduledAt}
              onChange={e => setFormData(d => ({ ...d, scheduledAt: e.target.value }))}
            />
            <Input
              label="Distance estimée (km)"
              type="number"
              min={1}
              value={formData.estimatedDistKm}
              onChange={e => setFormData(d => ({ ...d, estimatedDistKm: parseInt(e.target.value) || 0 }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Manutentionnaires</label>
              <select
                className="input-base"
                value={formData.nbHandlers}
                onChange={e => setFormData(d => ({ ...d, nbHandlers: parseInt(e.target.value) }))}
              >
                {[0,1,2,3,4].map(n => (
                  <option key={n} value={n}>{n === 0 ? 'Aucun' : `${n} manutentionnaire${n > 1 ? 's' : ''} (+${formatPrice(n * 15000)})`}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-accent"
                  checked={formData.isUrgent}
                  onChange={e => setFormData(d => ({ ...d, isUrgent: e.target.checked }))}
                />
                <span className="text-sm font-medium text-text">Mission urgente (+15%)</span>
              </label>
            </div>
          </div>
          <Textarea
            label="Description de la charge"
            placeholder="Ex: Mobilier de salon, environ 3 canapés et 1 table..."
            value={formData.cargoDescription}
            onChange={e => setFormData(d => ({ ...d, cargoDescription: e.target.value }))}
          />

          {/* Price summary */}
          <div className="bg-slate-50 rounded-xl p-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total estimé</span>
              <span className="text-accent">{formatPrice(calculatePrice({
                basePrice: truck.basePrice,
                distanceKm: formData.estimatedDistKm,
                pricePerKm: truck.pricePerKm,
                nbHandlers: formData.nbHandlers,
                isUrgent: formData.isUrgent,
              }).totalPrice)}</span>
            </div>
            <p className="text-xs text-muted mt-1">Commission 12% incluse · Acompte possible</p>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" block onClick={() => setShowBookingModal(false)}>
              Annuler
            </Button>
            <Button variant="accent" block loading={loading} onClick={handleBooking}>
              Confirmer et payer
            </Button>
          </div>
        </div>
      </Modal>

      <BottomNav />
    </main>
  )
}
