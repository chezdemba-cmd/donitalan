'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Truck, CheckCircle, ChevronLeft } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input, Select, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { TRUCK_TYPE_LABELS, type TruckType } from '@/types'
import { createTruck } from '@/app/actions/owner'
import Link from 'next/link'

interface AddTruckFormProps {
  cities: { id: string; name: string }[]
}

export function AddTruckForm({ cities }: AddTruckFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    truckType: 'TARPAULIN' as TruckType,
    capacityTons: '',
    volumeM3: '',
    basePrice: '',
    pricePerKm: '',
    cityId: cities.length > 0 ? cities[0].id : '',
    zones: '',
    withDriver: true,
    description: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.brand || !formData.model || !formData.licensePlate || !formData.capacityTons || !formData.basePrice || !formData.cityId) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    setLoading(true)
    try {
      const result = await createTruck({
        ...formData,
        year: Number(formData.year),
        capacityTons: Number(formData.capacityTons),
        volumeM3: formData.volumeM3 ? Number(formData.volumeM3) : undefined,
        basePrice: Number(formData.basePrice),
        pricePerKm: formData.pricePerKm ? Number(formData.pricePerKm) : undefined,
        zones: formData.zones.split(',').map(z => z.trim()).filter(z => z)
      })

      if (result.success) {
        toast.success('Camion ajouté avec succès ! En attente de validation.')
        router.push('/proprietaire')
        router.refresh()
      } else {
        toast.error(result.message || 'Erreur lors de l\'ajout')
      }
    } catch (error) {
      toast.error('Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/proprietaire" className="flex items-center gap-1 text-muted hover:text-text transition-colors text-sm w-fit">
        <ChevronLeft className="w-4 h-4" />
        Retour au tableau de bord
      </Link>
      
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text">Ajouter un nouveau camion</h1>
            <p className="text-sm text-muted">Renseignez les informations de votre véhicule. Il devra être validé par un administrateur.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Marque *"
              name="brand"
              placeholder="Ex: Mercedes"
              value={formData.brand}
              onChange={handleChange}
              required
            />
            <Input
              label="Modèle *"
              name="model"
              placeholder="Ex: Actros"
              value={formData.model}
              onChange={handleChange}
              required
            />
            <Input
              label="Année *"
              name="year"
              type="number"
              min={1990}
              max={new Date().getFullYear() + 1}
              value={formData.year}
              onChange={handleChange}
              required
            />
            <Input
              label="Plaque d'immatriculation *"
              name="licensePlate"
              placeholder="Ex: CH-1234-MD"
              value={formData.licensePlate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Type de camion *"
              name="truckType"
              value={formData.truckType}
              onChange={handleChange}
              options={Object.entries(TRUCK_TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            />
            <Select
              label="Ville de base *"
              name="cityId"
              value={formData.cityId}
              onChange={handleChange}
              options={cities.map(c => ({ value: c.id, label: c.name }))}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Capacité (Tonnes) *"
              name="capacityTons"
              type="number"
              step="0.1"
              placeholder="Ex: 5.5"
              value={formData.capacityTons}
              onChange={handleChange}
              required
            />
            <Input
              label="Volume (m³) - Optionnel"
              name="volumeM3"
              type="number"
              step="0.1"
              placeholder="Ex: 20"
              value={formData.volumeM3}
              onChange={handleChange}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Prix de base par jour (FCFA) *"
              name="basePrice"
              type="number"
              min={0}
              placeholder="Ex: 45000"
              value={formData.basePrice}
              onChange={handleChange}
              required
            />
            <Input
              label="Prix par km (FCFA) - Optionnel"
              name="pricePerKm"
              type="number"
              min={0}
              placeholder="Ex: 500"
              value={formData.pricePerKm}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Zones desservies (séparées par des virgules)"
            name="zones"
            placeholder="Ex: Bamako, Koulikoro, Kati"
            value={formData.zones}
            onChange={handleChange}
          />

          <Textarea
            label="Description (Optionnelle)"
            name="description"
            placeholder="Détails supplémentaires sur le camion..."
            value={formData.description}
            onChange={handleChange}
          />

          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <input
              type="checkbox"
              id="withDriver"
              name="withDriver"
              className="w-5 h-5 accent-primary cursor-pointer"
              checked={formData.withDriver}
              onChange={handleChange}
            />
            <label htmlFor="withDriver" className="font-medium text-text cursor-pointer select-none">
              Ce camion est fourni avec un chauffeur DoniTalan
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => router.push('/proprietaire')}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" loading={loading} leftIcon={<CheckCircle className="w-4 h-4" />}>
              Enregistrer le camion
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
