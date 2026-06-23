// Utility types for DoniTalan

export type UserRole = 'CLIENT' | 'COMPANY' | 'TRUCK_OWNER' | 'DRIVER' | 'ADMIN' | 'SUPER_ADMIN'
export type UserStatus = 'PENDING_VERIFICATION' | 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETED'
export type KYCStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED'

export type TruckType =
  | 'PICKUP' | 'MINIVAN' | 'CARGO_VAN' | 'TARPAULIN' | 'FLATBED'
  | 'TIPPER' | 'REFRIGERATED' | 'CRANE' | 'SEMI_TRAILER'
  | 'ROAD_TRACTOR' | 'CONTAINER_CARRIER' | 'CUSTOM'

export type TruckStatus = 'PENDING_VALIDATION' | 'VALIDATED' | 'SUSPENDED' | 'REJECTED'

export type ServiceType =
  | 'MOVING_RESIDENTIAL' | 'MOVING_COMMERCIAL'
  | 'TRUCK_RENTAL_HALF_DAY' | 'TRUCK_RENTAL_FULL_DAY' | 'TRUCK_RENTAL_MULTI_DAY'
  | 'CARGO_TRANSPORT' | 'LONG_TERM_CONTRACT' | 'INTERCITY_TRANSPORT'

export type BookingStatus =
  | 'DRAFT' | 'PENDING_OWNER_ACCEPTANCE' | 'ACCEPTED'
  | 'AWAITING_PAYMENT' | 'PAYMENT_SECURED' | 'DRIVER_ASSIGNED'
  | 'IN_PROGRESS' | 'COMPLETED_PENDING_VALIDATION' | 'COMPLETED'
  | 'CANCELLED_BY_CLIENT' | 'CANCELLED_BY_OWNER' | 'DISPUTED'
  | 'REFUNDED' | 'CLOSED'

export type PaymentStatus =
  | 'PENDING' | 'INITIATED' | 'FAILED' | 'SECURED'
  | 'PARTIALLY_PAID' | 'RELEASED' | 'REFUNDED' | 'DISPUTED' | 'CANCELLED'

export type PaymentMethod =
  | 'ORANGE_MONEY' | 'WAVE' | 'MOOV_MONEY' | 'SAMA_MONEY' | 'CORIS_MONEY'
  | 'CARD_VISA' | 'CARD_MASTERCARD' | 'CASH' | 'MTN_MONEY'
  | 'FREE_MONEY' | 'AIRTEL_MONEY' | 'SIMULATED'

export type DisputeStatus =
  | 'OPEN' | 'IN_ANALYSIS' | 'DOCUMENTS_REQUESTED'
  | 'RESOLVED' | 'PARTIAL_REFUND' | 'FULL_REFUND' | 'PAYMENT_RELEASED'

// Domain types
export interface User {
  id: string
  phone?: string
  email?: string
  firstName: string
  lastName: string
  avatarUrl?: string
  role: UserRole
  status: UserStatus
  phoneVerified: boolean
  emailVerified: boolean
  countryCode: string
  createdAt: string
}

export interface Truck {
  id: string
  brand: string
  model: string
  year: number
  licensePlate: string
  truckType: TruckType
  capacityTons: number
  volumeM3?: number
  description?: string
  basePrice: number
  pricePerKm?: number
  pricePerHour?: number
  currency: string
  cityId: string
  city?: City
  zones: string[]
  withDriver: boolean
  status: TruckStatus
  photoUrls: string[]
  averageRating: number
  totalTrips: number
  featured: boolean
  owner?: TruckOwner
  createdAt: string
}

export interface TruckOwner {
  id: string
  userId: string
  user: User
  kycStatus: KYCStatus
  totalEarnings: number
}

export interface Driver {
  id: string
  userId: string
  user: User
  licenseNumber: string
  verified: boolean
}

export interface Booking {
  id: string
  bookingNumber: string
  truckId: string
  truck?: Truck
  serviceType: ServiceType
  status: BookingStatus
  departureAddress: string
  arrivalAddress: string
  scheduledAt: string
  totalPrice: number
  currency: string
  payment?: Payment
  createdAt: string
}

export interface Payment {
  id: string
  bookingId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  platformFee: number
  ownerAmount: number
  paidAt?: string
  releasedAt?: string
}

export interface City {
  id: string
  name: string
  countryId: string
  country?: Country
}

export interface Country {
  id: string
  code: string
  name: string
  currency: string
  phonePrefix: string
  flag?: string
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Pricing
export interface PriceEstimate {
  basePrice: number
  distancePrice: number
  handlingFee: number
  urgencyFee: number
  platformFee: number
  totalPrice: number
  currency: string
  breakdown: Record<string, number>
}

// Truck type metadata
export const TRUCK_TYPE_LABELS: Record<TruckType, string> = {
  PICKUP: 'Pick-up',
  MINIVAN: 'Camionnette',
  CARGO_VAN: 'Fourgon',
  TARPAULIN: 'Camion bâché',
  FLATBED: 'Camion plateau',
  TIPPER: 'Camion benne',
  REFRIGERATED: 'Camion frigorifique',
  CRANE: 'Camion grue',
  SEMI_TRAILER: 'Semi-remorque',
  ROAD_TRACTOR: 'Tracteur routier',
  CONTAINER_CARRIER: 'Porte-conteneur',
  CUSTOM: 'Autre véhicule',
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  MOVING_RESIDENTIAL: 'Déménagement particulier',
  MOVING_COMMERCIAL: 'Déménagement commercial',
  TRUCK_RENTAL_HALF_DAY: 'Location demi-journée',
  TRUCK_RENTAL_FULL_DAY: 'Location journée',
  TRUCK_RENTAL_MULTI_DAY: 'Location plusieurs jours',
  CARGO_TRANSPORT: 'Transport de marchandises',
  LONG_TERM_CONTRACT: 'Contrat longue durée',
  INTERCITY_TRANSPORT: 'Transport interurbain',
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING_OWNER_ACCEPTANCE: 'En attente d\'acceptation',
  ACCEPTED: 'Acceptée',
  AWAITING_PAYMENT: 'En attente de paiement',
  PAYMENT_SECURED: 'Paiement sécurisé',
  DRIVER_ASSIGNED: 'Chauffeur assigné',
  IN_PROGRESS: 'En cours',
  COMPLETED_PENDING_VALIDATION: 'En attente de validation',
  COMPLETED: 'Terminée',
  CANCELLED_BY_CLIENT: 'Annulée par le client',
  CANCELLED_BY_OWNER: 'Annulée par le propriétaire',
  DISPUTED: 'En litige',
  REFUNDED: 'Remboursée',
  CLOSED: 'Clôturée',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  ORANGE_MONEY: 'Orange Money',
  WAVE: 'Wave',
  MOOV_MONEY: 'Moov Money',
  SAMA_MONEY: 'Sama Money',
  CORIS_MONEY: 'Coris Money',
  CARD_VISA: 'Carte Visa',
  CARD_MASTERCARD: 'Carte Mastercard',
  CASH: 'Espèces',
  MTN_MONEY: 'MTN Mobile Money',
  FREE_MONEY: 'Free Money',
  AIRTEL_MONEY: 'Airtel Money',
  SIMULATED: 'Paiement simulé',
}
