# 🚛 DoniTalan — Plateforme de Transport de Charge en Afrique de l'Ouest

> **DoniTalan** (du Bambara : "porter quelque chose de valeur") est une plateforme de mise en relation entre propriétaires de camions, clients particuliers et entreprises au Mali et en Afrique de l'Ouest.

---

## 🚀 Démarrage rapide

### Prérequis
- Node.js 18+
- PostgreSQL (ou compte Supabase gratuit)
- npm / yarn

### Installation

```bash
# 1. Cloner et installer les dépendances
cd DoniTalan
npm install

# 2. Configurer les variables d'environnement
cp .env.example .env.local
# Éditez .env.local avec vos valeurs

# 3. Pousser le schéma de base de données
npm run db:push

# 4. Remplir avec des données de démonstration
npm run db:seed

# 5. Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur : **http://localhost:3000**

---

## 🔐 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Super Admin | admin@donitalan.com | admin123! |
| Propriétaire | moussa@demo.ml | owner123! |
| Client | aminata@demo.ml | client123! |

---

## 📱 Pages principales

| URL | Description |
|-----|-------------|
| `/accueil` | Page d'accueil (hero, services, camions) |
| `/camions` | Recherche et liste des camions |
| `/camions/[id]` | Détail camion + réservation |
| `/paiement` | Page de paiement (simulé en dev) |
| `/reservations` | Mes réservations (client) |
| `/inscription` | Création de compte |
| `/connexion` | Connexion |
| `/proprietaire` | Dashboard propriétaire |
| `/admin` | Dashboard administrateur |

---

## 🏗️ Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── accueil/           # Page d'accueil
│   ├── camions/           # Liste + détail camions
│   ├── reservations/      # Réservations client
│   ├── paiement/          # Page paiement
│   ├── proprietaire/      # Dashboard propriétaire
│   ├── admin/             # Dashboard admin
│   ├── inscription/       # Inscription
│   ├── connexion/         # Connexion
│   └── api/               # Routes API
│       ├── auth/          # Auth (register, login, OTP)
│       ├── trucks/        # CRUD camions
│       └── bookings/      # CRUD réservations
├── components/
│   ├── ui/               # Design system (Button, Input, Card...)
│   ├── shared/           # Navigation, layout
│   ├── client/           # Composants espace client
│   ├── owner/            # Composants propriétaire
│   └── admin/            # Composants admin
├── lib/
│   ├── prisma.ts         # Client DB
│   ├── utils.ts          # Helpers
│   ├── otp.ts            # Système OTP
│   └── payment.ts        # Adaptateurs paiement
├── types/                # TypeScript types
└── middleware.ts          # Auth middleware JWT
```

---

## 💳 Système de paiement

### Mode MVP (actuel)
Le paiement est **simulé** (`PAYMENT_MODE=simulated`). Toutes les transactions sont acceptées automatiquement sans appel API réel.

### Intégration en production
Modifier `PAYMENT_MODE` dans `.env.local` :

```env
PAYMENT_MODE=orange_money   # Orange Money Mali
PAYMENT_MODE=wave           # Wave
PAYMENT_MODE=cinetpay       # CinetPay (cartes bancaires)
```

Ajouter les clés API correspondantes.

---

## 🔑 Variables d'environnement clés

```env
DATABASE_URL=          # PostgreSQL (Supabase recommandé)
NEXTAUTH_SECRET=       # Secret JWT (string aléatoire)
PAYMENT_MODE=          # simulated | orange_money | wave | cinetpay
AFRICAS_TALKING_API_KEY= # SMS OTP (sandbox par défaut)
NEXT_PUBLIC_MAPBOX_TOKEN= # Cartographie
```

---

## 📊 Modèle de données

21 tables Prisma :
`User`, `OtpCode`, `Client`, `Company`, `TruckOwner`, `Driver`, `Admin`, `Truck`, `TruckDocument`, `Booking`, `BookingStatusHistory`, `Payment`, `Payout`, `Dispute`, `Review`, `Message`, `Notification`, `Country`, `City`, `CountryPaymentMethod`, `Commission`, `PricingRule`, `Promotion`, `Contract`, `AuditLog`

---

## 🌍 Extension future

- [ ] React Native / Expo (app mobile native)
- [ ] WhatsApp Business API
- [ ] Google Maps / Mapbox tracking temps réel
- [ ] Orange Money, Wave, Moov Money APIs (production)
- [ ] Sénégal, Côte d'Ivoire, Burkina Faso
- [ ] KYC automatisé (Smile Identity)
- [ ] Contrats PDF numériques
- [ ] Transport interurbain + groupage retour

---

## 📞 Support

- WhatsApp : +223 70 00 00 00 (à configurer)
- Email : support@donitalan.com

---

*© 2024 DoniTalan · Mali · Version MVP 1.0*
