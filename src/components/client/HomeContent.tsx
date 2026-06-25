'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Truck, MapPin, Calendar, Shield, Star, CheckCircle,
  ArrowRight, Phone, Package, Building, Clock,
  ChevronRight, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { BottomNav } from '@/components/shared/Navigation'
import { TRUCK_TYPE_LABELS, type TruckType } from '@/types'
import { formatPrice } from '@/lib/utils'

const truckTypes: { type: TruckType; image: string; price: number; desc: string }[] = [
  { type: 'PICKUP', image: '/images/trucks/pickup.png', price: 15000, desc: 'Petits déménagements' },
  { type: 'CARGO_VAN', image: '/images/trucks/cargo_van.png', price: 25000, desc: 'Mobilier, cartons' },
  { type: 'TARPAULIN', image: '/images/trucks/tarpaulin.png', price: 45000, desc: 'Grandes charges' },
  { type: 'TIPPER', image: '/images/trucks/tipper.png', price: 55000, desc: 'Matériaux BTP' },
  { type: 'REFRIGERATED', image: '/images/trucks/refrigerated.png', price: 75000, desc: 'Produits frais' },
  { type: 'FLATBED', image: '/images/trucks/flatbed.png', price: 40000, desc: 'Équipements lourds' },
]

const services = [
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Déménagement',
    desc: 'Maison, appartement, bureau',
    href: '/camions?service=MOVING_RESIDENTIAL',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: 'Location camion',
    desc: 'Demi-journée, journée, contrat',
    href: '/camions?service=TRUCK_RENTAL_FULL_DAY',
    color: 'bg-orange-50 text-orange-500',
  },
  {
    icon: <Package className="w-6 h-6" />,
    title: 'Transport cargo',
    desc: 'Marchandises, matériaux',
    href: '/camions?service=CARGO_TRANSPORT',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: <Building className="w-6 h-6" />,
    title: 'Contrat entreprise',
    desc: 'Location longue durée',
    href: '/camions?service=LONG_TERM_CONTRACT',
    color: 'bg-purple-50 text-purple-600',
  },
]

const stats = [
  { label: 'Camions disponibles', value: '120+' },
  { label: 'Clients satisfaits', value: '1 500+' },
  { label: 'Missions réalisées', value: '4 200+' },
  { label: 'Villes couvertes', value: '6' },
]

const steps = [
  { num: '1', title: 'Choisissez', desc: 'Sélectionnez votre type de service et de camion', icon: '🔍' },
  { num: '2', title: 'Réservez', desc: 'Indiquez départ, arrivée et date souhaitée', icon: '📅' },
  { num: '3', title: 'Payez', desc: 'Orange Money, Wave, Moov Money ou carte', icon: '💳' },
  { num: '4', title: 'Suivez', desc: 'Suivez votre mission en temps réel', icon: '📍' },
]

const testimonials = [
  {
    name: 'Aminata Coulibaly',
    role: 'Cliente particulière',
    text: 'Déménagement rapide et sans stress ! Le camion était ponctuel et les manutentionnaires très professionnels.',
    rating: 5,
    city: 'Bamako',
  },
  {
    name: 'Moussa Diarra',
    role: 'Gérant, Diarra BTP',
    text: 'On utilise DoniTalan pour transporter nos matériaux de construction. Service fiable et prix transparents.',
    rating: 5,
    city: 'Bamako',
  },
  {
    name: 'Kadiatou Traoré',
    role: 'Commerçante',
    text: 'Le paiement via Orange Money est super pratique. Je recommande à tous les commerçants de Bamako !',
    rating: 5,
    city: 'Bamako',
  },
]

const paymentMethods = [
  { name: 'Orange Money', color: '#FF6600', letter: 'O' },
  { name: 'Wave', color: '#1E88E5', letter: 'W' },
  { name: 'Moov Money', color: '#003893', letter: 'M' },
  { name: 'Sama Money', color: '#E31E26', letter: 'S' },
  { name: 'Carte Visa', color: '#1A1F71', letter: 'V' },
]

export function HomeContent() {
  return (
    <main className="pb-20 md:pb-0">
      {/* ====== HERO ====== */}
      <section className="hero-gradient text-white py-16 sm:py-24 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white blur-3xl" />
        </div>

        <div className="container-app relative z-10">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-white bg-opacity-15 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4 text-accent" />
                <span>N°1 du transport de charge à Bamako</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6">
                Transportez vos{' '}
                <span className="text-accent">charges</span>{' '}
                en toute confiance
              </h1>
              <p className="text-lg text-blue-100 mb-8 max-w-xl">
                Trouvez le camion idéal pour votre déménagement, transport de marchandises ou location à Bamako et dans toute la région. Paiement sécurisé, suivi en temps réel.
              </p>
            </motion.div>

            {/* Quick Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="glass-card p-5"
            >
              <QuickSearchForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== STATS ====== */}
      <section className="bg-white py-8 border-b border-slate-100">
        <div className="container-app">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {stats.map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-black text-primary">{stat.value}</div>
                <div className="text-sm text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== SERVICES ====== */}
      <section className="section">
        <div className="container-app">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-3">Nos services</h2>
            <p className="text-muted max-w-lg mx-auto">
              Que vous soyez particulier ou entreprise, nous avons la solution adaptée à vos besoins de transport.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {services.map(service => (
              <Link key={service.title} href={service.href}>
                <Card interactive className="text-center p-5 h-full flex flex-col items-center gap-3">
                  <div className={`p-4 rounded-2xl ${service.color}`}>
                    {service.icon}
                  </div>
                  <div>
                    <div className="font-bold text-text text-sm sm:text-base">{service.title}</div>
                    <div className="text-xs text-muted mt-0.5 hidden sm:block">{service.desc}</div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TYPES DE CAMIONS ====== */}
      <section className="section bg-slate-50">
        <div className="container-app">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-text">Types de véhicules</h2>
              <p className="text-muted text-sm mt-1">À partir de — Prix indicatifs</p>
            </div>
            <Link href="/camions" className="text-accent font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {truckTypes.map(truck => (
              <Link key={truck.type} href={`/camions?type=${truck.type}`}>
                <Card interactive className="text-center p-4 flex flex-col items-center">
                  <div className="relative w-24 h-16 mb-2">
                    <Image src={truck.image} alt={TRUCK_TYPE_LABELS[truck.type]} fill className="object-contain" />
                  </div>
                  <div className="font-semibold text-text text-sm">{TRUCK_TYPE_LABELS[truck.type]}</div>
                  <div className="text-xs text-muted mt-0.5">{truck.desc}</div>
                  <div className="mt-2 text-accent font-bold text-xs">
                    dès {formatPrice(truck.price)}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== COMMENT ÇA MARCHE ====== */}
      <section className="section">
        <div className="container-app">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-3">Comment ça marche ?</h2>
            <p className="text-muted">Réservez votre camion en moins de 3 minutes</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={step.num} className="relative text-center">
                <div className="text-5xl mb-3">{step.icon}</div>
                <div className="w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center font-bold text-sm mx-auto mb-3">
                  {step.num}
                </div>
                <h3 className="font-bold text-text mb-1">{step.title}</h3>
                <p className="text-sm text-muted">{step.desc}</p>
                {index < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-6 left-[calc(50%+40px)] right-0 h-0.5 bg-slate-100" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== GARANTIES ====== */}
      <section className="section bg-primary text-white">
        <div className="container-app">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white bg-opacity-15 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4 text-accent" />
                Votre confiance, notre priorité
              </div>
              <h2 className="text-3xl font-bold mb-6">
                Payez en toute sécurité avec notre système de séquestre
              </h2>
              <p className="text-blue-200 mb-8">
                Votre paiement est sécurisé jusqu'à la fin de la mission. Le propriétaire est payé uniquement après votre validation.
              </p>
              <div className="space-y-3">
                {[
                  'Vérification de chaque camion et propriétaire',
                  'Paiement sécurisé via séquestre',
                  'Code OTP pour démarrer et terminer la mission',
                  'Remboursement garanti en cas de problème',
                  'Support WhatsApp 7j/7',
                ].map(point => (
                  <div key={point} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                    <span className="text-blue-100">{point}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <GuaranteeCard icon="🔒" title="Paiement sécurisé" desc="Escrow numérique" />
              <GuaranteeCard icon="✅" title="Camions vérifiés" desc="Documents contrôlés" />
              <GuaranteeCard icon="📍" title="Suivi GPS" desc="Mission en temps réel" />
              <GuaranteeCard icon="💬" title="Support actif" desc="WhatsApp + téléphone" />
            </div>
          </div>
        </div>
      </section>

      {/* ====== PAIEMENTS ====== */}
      <section className="section">
        <div className="container-app">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-text mb-2">Modes de paiement acceptés</h2>
            <p className="text-muted">Payez avec votre méthode préférée</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {paymentMethods.map(method => (
              <div
                key={method.name}
                className="flex items-center gap-3 bg-white rounded-2xl px-5 py-3 shadow-sm border border-slate-100"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ backgroundColor: method.color }}
                >
                  {method.letter}
                </div>
                <span className="font-medium text-text text-sm">{method.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TÉMOIGNAGES ====== */}
      <section className="section bg-slate-50">
        <div className="container-app">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-text mb-2">Ils nous font confiance</h2>
            <p className="text-muted">Les avis de nos clients à Bamako</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <Card key={t.name} className="flex flex-col gap-4">
                <div className="flex text-warning text-lg">
                  {'★'.repeat(t.rating)}
                </div>
                <p className="text-text leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-text text-sm">{t.name}</div>
                    <div className="text-xs text-muted">{t.role} · {t.city}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA FINALE ====== */}
      <section className="section">
        <div className="container-app">
          <div className="bg-gradient-to-r from-primary to-primary-600 rounded-3xl p-8 sm:p-12 text-white text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-accent blur-3xl" />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Prêt à transporter votre charge ?</h2>
              <p className="text-blue-200 mb-8 max-w-md mx-auto">
                Rejoignez plus de 1500 clients qui font confiance à DoniTalan pour leurs transports à Bamako.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/camions">
                  <Button variant="accent" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Chercher un camion
                  </Button>
                </Link>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '22370000000'}`}
                   target="_blank" rel="noopener noreferrer">
                  <Button
                    size="lg"
                    className="bg-white text-primary hover:bg-blue-50"
                    leftIcon={<Phone className="w-5 h-5" />}
                  >
                    Contacter sur WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-10">
        <div className="container-app">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-xl mb-4">
                <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                  <Truck className="w-4 h-4 text-white" />
                </div>
                DoniTalan
              </div>
              <p className="text-slate-400 text-sm leading-relaxed">
                La plateforme de référence pour le transport de charge et la location de camions en Afrique de l'Ouest.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><Link href="/camions?service=MOVING_RESIDENTIAL" className="hover:text-white transition-colors">Déménagement</Link></li>
                <li><Link href="/camions?service=TRUCK_RENTAL_FULL_DAY" className="hover:text-white transition-colors">Location camion</Link></li>
                <li><Link href="/camions?service=CARGO_TRANSPORT" className="hover:text-white transition-colors">Transport cargo</Link></li>
                <li><Link href="/camions?service=LONG_TERM_CONTRACT" className="hover:text-white transition-colors">Contrats entreprises</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>📞 +223 70 00 00 00</li>
                <li>📧 support@donitalan.com</li>
                <li>💬 WhatsApp disponible</li>
                <li>📍 Bamako, Mali</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-slate-400 text-sm">
            <div>© 2024 DoniTalan. Tous droits réservés.</div>
            <div className="flex gap-4">
              <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
              <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            </div>
          </div>
        </div>
      </footer>

      <BottomNav />
    </main>
  )
}

function GuaranteeCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white bg-opacity-10 rounded-2xl p-5 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="font-bold text-sm">{title}</div>
      <div className="text-blue-300 text-xs mt-0.5">{desc}</div>
    </div>
  )
}

function QuickSearchForm() {
  const [serviceType, setServiceType] = React.useState('MOVING_RESIDENTIAL')

  return (
    <div>
      <p className="font-semibold text-text mb-4">🔍 Trouver un camion rapidement</p>
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted font-medium block mb-1">Type de service</label>
          <select
            value={serviceType}
            onChange={e => setServiceType(e.target.value)}
            className="input-base text-text bg-white"
          >
            <option value="MOVING_RESIDENTIAL">Déménagement</option>
            <option value="TRUCK_RENTAL_FULL_DAY">Location journée</option>
            <option value="CARGO_TRANSPORT">Transport cargo</option>
            <option value="LONG_TERM_CONTRACT">Contrat entreprise</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted font-medium block mb-1">Ville</label>
          <select className="input-base text-text bg-white">
            <option value="bamako">Bamako</option>
            <option value="sikasso">Sikasso</option>
            <option value="segou">Ségou</option>
            <option value="kayes">Kayes</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-muted font-medium block mb-1">&nbsp;</label>
          <Link href={`/camions?service=${serviceType}`} className="block">
            <Button variant="accent" block>
              Chercher 🚛
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
