'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal, Truck, Star, MapPin, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Select } from '@/components/ui/Input'
import { Card, Badge, EmptyState, Spinner } from '@/components/ui/Card'
import { BottomNav } from '@/components/shared/Navigation'
import { TRUCK_TYPE_LABELS, SERVICE_TYPE_LABELS, type TruckType, type ServiceType } from '@/types'
import { formatPrice } from '@/lib/utils'

const truckTypeOptions = Object.entries(TRUCK_TYPE_LABELS).map(([value, label]) => ({ value, label }))
const serviceTypeOptions = Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({ value, label }))

const sortOptions = [
  { value: 'rating', label: 'Mieux notés' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'trips', label: 'Plus expérimentés' },
]

const CITIES = [
  { value: '', label: 'Toutes les villes' },
  { value: 'bamako', label: 'Bamako' },
  { value: 'sikasso', label: 'Sikasso' },
  { value: 'segou', label: 'Ségou' },
  { value: 'kayes', label: 'Kayes' },
  { value: 'koulikoro', label: 'Koulikoro' },
  { value: 'mopti', label: 'Mopti' },
]

// Demo trucks for MVP
const DEMO_TRUCKS = [
  {
    id: 'truck-1', brand: 'Mercedes', model: 'Actros', year: 2019,
    truckType: 'TARPAULIN' as TruckType, capacityTons: 20, volumeM3: 80,
    basePrice: 45000, currency: 'XOF', withDriver: true,
    photoUrls: [], averageRating: 4.8, totalTrips: 87,
    city: { name: 'Bamako' },
    owner: { user: { firstName: 'Moussa', lastName: 'Diarra' } },
    status: 'VALIDATED', zones: ['Bamako', 'Ségou'],
    description: 'Camion bâché en excellent état, avec chauffeur expérimenté. Disponible 7j/7.',
  },
  {
    id: 'truck-2', brand: 'Toyota', model: 'Hilux', year: 2021,
    truckType: 'PICKUP' as TruckType, capacityTons: 1.5, volumeM3: 8,
    basePrice: 15000, currency: 'XOF', withDriver: true,
    photoUrls: [], averageRating: 4.9, totalTrips: 134,
    city: { name: 'Bamako' },
    owner: { user: { firstName: 'Aminata', lastName: 'Koné' } },
    status: 'VALIDATED', zones: ['Bamako'],
    description: 'Pick-up robuste pour petits déménagements et livraisons. Disponible en moins de 2h.',
  },
  {
    id: 'truck-3', brand: 'Renault', model: 'Master', year: 2020,
    truckType: 'CARGO_VAN' as TruckType, capacityTons: 3.5, volumeM3: 20,
    basePrice: 25000, currency: 'XOF', withDriver: true,
    photoUrls: [], averageRating: 4.7, totalTrips: 62,
    city: { name: 'Bamako' },
    owner: { user: { firstName: 'Ibrahim', lastName: 'Traoré' } },
    status: 'VALIDATED', zones: ['Bamako', 'Kayes'],
    description: 'Fourgon idéal pour déménagement appartement ou bureau.',
  },
  {
    id: 'truck-4', brand: 'Volvo', model: 'FH 540', year: 2018,
    truckType: 'SEMI_TRAILER' as TruckType, capacityTons: 40, volumeM3: 120,
    basePrice: 120000, currency: 'XOF', withDriver: true,
    photoUrls: [], averageRating: 4.6, totalTrips: 45,
    city: { name: 'Bamako' },
    owner: { user: { firstName: 'Seydou', lastName: 'Coulibaly' } },
    status: 'VALIDATED', zones: ['Bamako', 'Sikasso', 'Ségou', 'Kayes'],
    description: 'Semi-remorque pour grandes charges et transport longue distance.',
  },
  {
    id: 'truck-5', brand: 'Isuzu', model: 'NMR', year: 2020,
    truckType: 'TIPPER' as TruckType, capacityTons: 8, volumeM3: 15,
    basePrice: 55000, currency: 'XOF', withDriver: true,
    photoUrls: [], averageRating: 4.5, totalTrips: 78,
    city: { name: 'Bamako' },
    owner: { user: { firstName: 'Fatoumata', lastName: 'Sanogo' } },
    status: 'VALIDATED', zones: ['Bamako'],
    description: 'Benne pour sable, gravier, déchets de chantier. Déchargement automatique.',
  },
  {
    id: 'truck-6', brand: 'Mitsubishi', model: 'Canter', year: 2019,
    truckType: 'FLATBED' as TruckType, capacityTons: 5, volumeM3: 25,
    basePrice: 35000, currency: 'XOF', withDriver: true,
    photoUrls: [], averageRating: 4.7, totalTrips: 52,
    city: { name: 'Bamako' },
    owner: { user: { firstName: 'Oumar', lastName: 'Bah' } },
    status: 'VALIDATED', zones: ['Bamako', 'Koulikoro'],
    description: 'Plateau pour machines, équipements industriels, mobilier encombrant.',
  },
]

export function TrucksSearchPage() {
  const searchParams = useSearchParams()
  const [search, setSearch] = React.useState('')
  const [truckType, setTruckType] = React.useState(searchParams.get('type') || '')
  const [serviceType, setServiceType] = React.useState(searchParams.get('service') || '')
  const [city, setCity] = React.useState('')
  const [sortBy, setSortBy] = React.useState('rating')
  const [showFilters, setShowFilters] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  // Filter trucks from demo data
  const trucks = DEMO_TRUCKS.filter(truck => {
    if (search && !`${truck.brand} ${truck.model}`.toLowerCase().includes(search.toLowerCase())) return false
    if (truckType && truck.truckType !== truckType) return false
    if (city && !truck.zones.some(z => z.toLowerCase().includes(city.toLowerCase()))) return false
    return true
  }).sort((a, b) => {
    if (sortBy === 'price_asc') return a.basePrice - b.basePrice
    if (sortBy === 'price_desc') return b.basePrice - a.basePrice
    if (sortBy === 'trips') return b.totalTrips - a.totalTrips
    return b.averageRating - a.averageRating
  })

  return (
    <main className="min-h-screen bg-surface pb-24 md:pb-8">
      {/* Search Header */}
      <div className="bg-primary text-white py-8">
        <div className="container-app">
          <h1 className="text-2xl font-bold mb-4">Trouver un camion</h1>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par marque, modèle..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-base pl-10 w-full text-text"
              />
            </div>
            <Button
              variant="outline"
              className="bg-white text-primary border-white hover:bg-blue-50 flex-shrink-0"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<SlidersHorizontal className="w-4 h-4" />}
            >
              Filtres
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border-b border-slate-100 py-4 animate-slide-down">
          <div className="container-app">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Select
                label="Type de camion"
                value={truckType}
                onChange={e => setTruckType(e.target.value)}
                options={[{ value: '', label: 'Tous les types' }, ...truckTypeOptions]}
              />
              <Select
                label="Type de service"
                value={serviceType}
                onChange={e => setServiceType(e.target.value)}
                options={[{ value: '', label: 'Tous les services' }, ...serviceTypeOptions]}
              />
              <Select
                label="Ville"
                value={city}
                onChange={e => setCity(e.target.value)}
                options={CITIES}
              />
              <Select
                label="Trier par"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                options={sortOptions}
              />
            </div>
            <div className="flex gap-2 mt-3">
              {truckType && (
                <button
                  onClick={() => setTruckType('')}
                  className="badge badge-primary flex items-center gap-1"
                >
                  {TRUCK_TYPE_LABELS[truckType as TruckType]}
                  <X className="w-3 h-3" />
                </button>
              )}
              {city && (
                <button onClick={() => setCity('')} className="badge badge-muted flex items-center gap-1">
                  {city} <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick service filters */}
      <div className="bg-white border-b border-slate-100">
        <div className="container-app py-3">
          <div className="flex gap-2 overflow-x-auto scroll-snap pb-1">
            {[
              { label: '🏠 Déménagement', value: 'MOVING_RESIDENTIAL' },
              { label: '🚛 Location', value: 'TRUCK_RENTAL_FULL_DAY' },
              { label: '📦 Transport cargo', value: 'CARGO_TRANSPORT' },
              { label: '🏢 Entreprise', value: 'LONG_TERM_CONTRACT' },
            ].map(s => (
              <button
                key={s.value}
                onClick={() => setServiceType(serviceType === s.value ? '' : s.value)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                  serviceType === s.value
                    ? 'bg-accent text-white border-accent'
                    : 'bg-white text-muted border-slate-200 hover:border-slate-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container-app py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-muted text-sm">
            <span className="font-semibold text-text">{trucks.length}</span> camion{trucks.length !== 1 ? 's' : ''} disponible{trucks.length !== 1 ? 's' : ''}
          </p>
        </div>

        {loading ? (
          <Spinner size="lg" className="py-20" />
        ) : trucks.length === 0 ? (
          <EmptyState
            icon={<Truck />}
            title="Aucun camion trouvé"
            description="Modifiez vos critères de recherche ou contactez-nous pour une demande personnalisée."
            action={
              <Button variant="accent" onClick={() => { setSearch(''); setTruckType(''); setCity('') }}>
                Réinitialiser les filtres
              </Button>
            }
          />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {trucks.map(truck => (
              <TruckCard key={truck.id} truck={truck} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  )
}

function TruckCard({ truck }: { truck: typeof DEMO_TRUCKS[0] }) {
  const truckImages: Record<TruckType, string> = {
    PICKUP: '/images/trucks/pickup.png', MINIVAN: '/images/trucks/cargo_van.png', 
    CARGO_VAN: '/images/trucks/cargo_van.png', TARPAULIN: '/images/trucks/tarpaulin.png',
    FLATBED: '/images/trucks/flatbed.png', TIPPER: '/images/trucks/tipper.png', 
    REFRIGERATED: '/images/trucks/refrigerated.png', CRANE: '/images/trucks/flatbed.png',
    SEMI_TRAILER: '/images/trucks/semi_trailer.png', ROAD_TRACTOR: '/images/trucks/semi_trailer.png', 
    CONTAINER_CARRIER: '/images/trucks/semi_trailer.png', CUSTOM: '/images/trucks/tarpaulin.png',
  }

  return (
    <Link href={`/camions/${truck.id}`}>
      <Card interactive className="overflow-hidden p-0 h-full flex flex-col">
        {/* Image */}
        <div className="h-48 bg-white relative flex items-center justify-center border-b border-slate-100">
          <Image src={truckImages[truck.truckType]} alt={truck.brand} fill className="object-contain p-4 mix-blend-multiply" />
          <div className="absolute top-3 left-3">
            <Badge variant="success" dot>Disponible</Badge>
          </div>
          {truck.averageRating >= 4.8 && (
            <div className="absolute top-3 right-3">
              <Badge variant="warning">⭐ Top</Badge>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col gap-3 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-text">{truck.brand} {truck.model}</h3>
              <p className="text-sm text-muted">{TRUCK_TYPE_LABELS[truck.truckType]} • {truck.year}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-bold text-accent text-base">{formatPrice(truck.basePrice)}</div>
              <div className="text-xs text-muted">par jour</div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="flex items-center gap-1">
              <span className="text-warning">★</span>
              <span className="font-semibold text-text">{truck.averageRating}</span>
              <span>({truck.totalTrips} missions)</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {truck.city.name}
            </span>
          </div>

          <div className="flex gap-1 flex-wrap">
            <span className="badge badge-muted text-xs">{truck.capacityTons}t</span>
            {truck.volumeM3 && <span className="badge badge-muted text-xs">{truck.volumeM3}m³</span>}
            {truck.withDriver && <span className="badge badge-success text-xs">Avec chauffeur</span>}
          </div>

          <p className="text-sm text-muted line-clamp-2 mt-auto">{truck.description}</p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="text-xs text-muted">
              Par {truck.owner.user.firstName} {truck.owner.user.lastName.charAt(0)}.
            </div>
            <span className="text-accent text-sm font-semibold flex items-center gap-1">
              Réserver <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
