import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding DoniTalan database...')

  // ============================================================
  // COUNTRIES
  // ============================================================
  const mali = await prisma.country.upsert({
    where: { code: 'ML' },
    update: {},
    create: {
      code: 'ML',
      name: 'Mali',
      nativeName: 'Mali',
      currency: 'XOF',
      currencySymbol: 'FCFA',
      phonePrefix: '+223',
      flag: '🇲🇱',
      active: true,
    },
  })

  const senegal = await prisma.country.upsert({
    where: { code: 'SN' },
    update: {},
    create: {
      code: 'SN',
      name: 'Sénégal',
      currency: 'XOF',
      currencySymbol: 'FCFA',
      phonePrefix: '+221',
      flag: '🇸🇳',
      active: false, // Futur
    },
  })

  const ci = await prisma.country.upsert({
    where: { code: 'CI' },
    update: {},
    create: {
      code: 'CI',
      name: "Côte d'Ivoire",
      currency: 'XOF',
      currencySymbol: 'FCFA',
      phonePrefix: '+225',
      flag: '🇨🇮',
      active: false,
    },
  })

  console.log('✅ Countries created')

  // ============================================================
  // CITIES — Mali
  // ============================================================
  const bamako = await prisma.city.upsert({
    where: { countryId_name: { countryId: mali.id, name: 'Bamako' } },
    update: {},
    create: { countryId: mali.id, name: 'Bamako', latitude: 12.6392, longitude: -8.0029, active: true },
  })

  const cities = ['Sikasso', 'Ségou', 'Kayes', 'Koulikoro', 'Mopti', 'Gao', 'Tombouctou']
  for (const cityName of cities) {
    await prisma.city.upsert({
      where: { countryId_name: { countryId: mali.id, name: cityName } },
      update: {},
      create: { countryId: mali.id, name: cityName, active: true },
    })
  }
  console.log('✅ Cities created')

  // ============================================================
  // PAYMENT METHODS — Mali
  // ============================================================
  const malianMethods = [
    { method: 'ORANGE_MONEY', displayName: 'Orange Money Mali', feePercent: 1.0, active: true },
    { method: 'WAVE', displayName: 'Wave Mali', feePercent: 1.0, active: true },
    { method: 'MOOV_MONEY', displayName: 'Moov Money', feePercent: 1.5, active: true },
    { method: 'SAMA_MONEY', displayName: 'Sama Money', feePercent: 1.5, active: true },
    { method: 'CARD_VISA', displayName: 'Carte Visa/Mastercard', feePercent: 2.5, active: true },
    { method: 'CASH', displayName: 'Espèces (agent)', feePercent: 0, active: true },
  ]

  for (const pm of malianMethods) {
    await prisma.countryPaymentMethod.upsert({
      where: { countryId_method: { countryId: mali.id, method: pm.method as never } },
      update: {},
      create: {
        countryId: mali.id,
        method: pm.method as never,
        displayName: pm.displayName,
        active: pm.active,
        feePercent: pm.feePercent,
      },
    })
  }
  console.log('✅ Payment methods created')

  // ============================================================
  // COMMISSIONS
  // ============================================================
  await prisma.commission.upsert({
    where: { id: 'commission-default' },
    update: {},
    create: {
      id: 'commission-default',
      name: 'Commission standard',
      percent: 12,
      countryCode: 'ML',
      active: true,
    },
  })

  await prisma.commission.upsert({
    where: { id: 'commission-enterprise' },
    update: {},
    create: {
      id: 'commission-enterprise',
      name: 'Commission entreprise',
      percent: 10,
      serviceType: 'LONG_TERM_CONTRACT',
      countryCode: 'ML',
      active: true,
    },
  })
  console.log('✅ Commissions created')

  // ============================================================
  // ADMIN USER
  // ============================================================
  const adminPasswordHash = await bcrypt.hash('admin123!', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@donitalan.com' },
    update: {},
    create: {
      email: 'admin@donitalan.com',
      phone: '+22370000000',
      firstName: 'Admin',
      lastName: 'DoniTalan',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      phoneVerified: true,
      emailVerified: true,
      countryCode: 'ML',
      admin: { create: { level: 2 } },
    },
  })
  console.log('✅ Admin created: admin@donitalan.com / admin123!')

  // ============================================================
  // TRUCK OWNERS (Demo)
  // ============================================================
  const owners = [
    { firstName: 'Moussa', lastName: 'Diarra', phone: '+22376000001', email: 'moussa@demo.ml', mobileMoneyNumber: '+22376000001' },
    { firstName: 'Fatoumata', lastName: 'Koné', phone: '+22377000002', email: 'fatoumata@demo.ml', mobileMoneyNumber: '+22377000002' },
    { firstName: 'Ibrahim', lastName: 'Traoré', phone: '+22378000003', email: 'ibrahim@demo.ml', mobileMoneyNumber: '+22378000003' },
    { firstName: 'Seydou', lastName: 'Coulibaly', phone: '+22379000004', email: 'seydou@demo.ml', mobileMoneyNumber: '+22379000004' },
  ]

  const ownerPasswordHash = await bcrypt.hash('owner123!', 12)
  const createdOwners = []

  for (const ownerData of owners) {
    const ownerUser = await prisma.user.upsert({
      where: { email: ownerData.email },
      update: {},
      create: {
        email: ownerData.email,
        phone: ownerData.phone,
        firstName: ownerData.firstName,
        lastName: ownerData.lastName,
        passwordHash: ownerPasswordHash,
        role: 'TRUCK_OWNER',
        status: 'ACTIVE',
        phoneVerified: true,
        countryCode: 'ML',
      },
    })

    const owner = await prisma.truckOwner.upsert({
      where: { userId: ownerUser.id },
      update: {},
      create: {
        userId: ownerUser.id,
        kycStatus: 'VERIFIED',
        kycVerifiedAt: new Date(),
        mobileMoneyNumber: ownerData.mobileMoneyNumber,
        mobileMoneyOperator: 'ORANGE_MONEY',
        totalEarnings: Math.round(Math.random() * 3000000),
      },
    })

    createdOwners.push(owner)
  }
  console.log('✅ Truck owners created')

  // ============================================================
  // TRUCKS (Demo Data)
  // ============================================================
  const trucks = [
    {
      brand: 'Mercedes', model: 'Actros', year: 2019, licensePlate: 'BK-2019-A',
      truckType: 'TARPAULIN', capacityTons: 20, volumeM3: 80,
      basePrice: 45000, pricePerKm: 200, pricePerHour: 5000,
      ownerIndex: 0, status: 'VALIDATED', averageRating: 4.8, totalTrips: 87, featured: true,
      description: 'Camion bâché Mercedes Actros en excellent état. Chauffeur expérimenté. Bamako et régions.',
      zones: ['Bamako', 'Ségou', 'Kayes', 'Sikasso'],
    },
    {
      brand: 'Toyota', model: 'Hilux', year: 2021, licensePlate: 'BK-2021-B',
      truckType: 'PICKUP', capacityTons: 1.5, volumeM3: 8,
      basePrice: 15000, pricePerKm: 100, pricePerHour: 2000,
      ownerIndex: 1, status: 'VALIDATED', averageRating: 4.9, totalTrips: 134, featured: true,
      description: 'Pick-up robuste pour petits déménagements. Disponible en moins de 2h.',
      zones: ['Bamako'],
    },
    {
      brand: 'Renault', model: 'Master', year: 2020, licensePlate: 'BK-2020-C',
      truckType: 'CARGO_VAN', capacityTons: 3.5, volumeM3: 20,
      basePrice: 25000, pricePerKm: 150, pricePerHour: 3000,
      ownerIndex: 2, status: 'VALIDATED', averageRating: 4.7, totalTrips: 62, featured: false,
      description: 'Fourgon idéal pour déménagement appartement ou bureau.',
      zones: ['Bamako', 'Kayes'],
    },
    {
      brand: 'Volvo', model: 'FH 540', year: 2018, licensePlate: 'BK-2018-D',
      truckType: 'SEMI_TRAILER', capacityTons: 40, volumeM3: 120,
      basePrice: 120000, pricePerKm: 500, pricePerHour: 10000,
      ownerIndex: 3, status: 'VALIDATED', averageRating: 4.6, totalTrips: 45, featured: false,
      description: 'Semi-remorque pour grandes charges et transport longue distance.',
      zones: ['Bamako', 'Sikasso', 'Ségou', 'Kayes', 'Mopti'],
    },
    {
      brand: 'Isuzu', model: 'NMR', year: 2020, licensePlate: 'BK-2020-E',
      truckType: 'TIPPER', capacityTons: 8, volumeM3: 15,
      basePrice: 55000, pricePerKm: 250, pricePerHour: 6000,
      ownerIndex: 0, status: 'VALIDATED', averageRating: 4.5, totalTrips: 78, featured: false,
      description: 'Benne pour sable, gravier, déchets de chantier.',
      zones: ['Bamako'],
    },
    {
      brand: 'Mitsubishi', model: 'Canter', year: 2019, licensePlate: 'BK-2019-F',
      truckType: 'FLATBED', capacityTons: 5, volumeM3: 25,
      basePrice: 35000, pricePerKm: 180, pricePerHour: 4000,
      ownerIndex: 1, status: 'VALIDATED', averageRating: 4.7, totalTrips: 52, featured: false,
      description: 'Plateau pour machines, équipements industriels.',
      zones: ['Bamako', 'Koulikoro'],
    },
    {
      brand: 'DAF', model: 'XF 480', year: 2020, licensePlate: 'BK-2020-G',
      truckType: 'TARPAULIN', capacityTons: 25, volumeM3: 90,
      basePrice: 65000, pricePerKm: 300, pricePerHour: 7000,
      ownerIndex: 2, status: 'PENDING_VALIDATION', averageRating: 0, totalTrips: 0, featured: false,
      description: 'Nouveau camion bâché en cours de validation.',
      zones: ['Bamako'],
    },
  ]

  for (const truckData of trucks) {
    const owner = createdOwners[truckData.ownerIndex]
    await prisma.truck.upsert({
      where: { licensePlate: truckData.licensePlate },
      update: {},
      create: {
        ownerId: owner.id,
        brand: truckData.brand,
        model: truckData.model,
        year: truckData.year,
        licensePlate: truckData.licensePlate,
        truckType: truckData.truckType as never,
        capacityTons: truckData.capacityTons,
        volumeM3: truckData.volumeM3,
        basePrice: truckData.basePrice,
        pricePerKm: truckData.pricePerKm,
        pricePerHour: truckData.pricePerHour,
        currency: 'XOF',
        cityId: bamako.id,
        zones: truckData.zones,
        withDriver: true,
        status: truckData.status as never,
        validatedAt: truckData.status === 'VALIDATED' ? new Date() : null,
        averageRating: truckData.averageRating,
        totalTrips: truckData.totalTrips,
        featured: truckData.featured,
        description: truckData.description,
        photoUrls: [],
      },
    })
  }
  console.log('✅ Trucks created')

  // ============================================================
  // DRIVER (Demo)
  // ============================================================
  const driverPasswordHash = await bcrypt.hash('driver123!', 12)
  const driverUser = await prisma.user.upsert({
    where: { email: 'chauffeur@demo.ml' },
    update: {},
    create: {
      email: 'chauffeur@demo.ml',
      phone: '+22375000000',
      firstName: 'Salif',
      lastName: 'Keita',
      passwordHash: driverPasswordHash,
      role: 'DRIVER',
      status: 'ACTIVE',
      phoneVerified: true,
      countryCode: 'ML',
    },
  })

  await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      ownerId: createdOwners[0].id, // Assigned to the first owner
      licenseNumber: 'PC-123456789',
      verified: true,
    },
  })
  console.log('✅ Demo driver created')

  // ============================================================
  // CLIENT USERS (Demo)
  // ============================================================
  const clientPasswordHash = await bcrypt.hash('client123!', 12)
  const demoClients = [
    { firstName: 'Aminata', lastName: 'Traoré', phone: '+22371000001', email: 'aminata@demo.ml' },
    { firstName: 'Kadiatou', lastName: 'Sanogo', phone: '+22372000002', email: 'kadiatou@demo.ml' },
    { firstName: 'Oumar', lastName: 'Bah', phone: '+22373000003', email: 'oumar@demo.ml' },
  ]

  for (const clientData of demoClients) {
    const clientUser = await prisma.user.upsert({
      where: { email: clientData.email },
      update: {},
      create: {
        email: clientData.email,
        phone: clientData.phone,
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        passwordHash: clientPasswordHash,
        role: 'CLIENT',
        status: 'ACTIVE',
        phoneVerified: true,
        countryCode: 'ML',
        client: { create: {} },
      },
    })
  }
  console.log('✅ Demo clients created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📋 Comptes de démonstration:')
  console.log('   Admin:       admin@donitalan.com   / admin123!')
  console.log('   Propriétaire: moussa@demo.ml       / owner123!')
  console.log('   Chauffeur:   chauffeur@demo.ml    / driver123!')
  console.log('   Client:      aminata@demo.ml       / client123!')
}

main()
  .catch(e => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
