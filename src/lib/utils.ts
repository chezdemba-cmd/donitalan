import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

// ============================================================
// CSS CLASS MERGING
// ============================================================
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// CURRENCY FORMATTING
// ============================================================
export function formatPrice(
  amount: number,
  currency: string = 'XOF',
  locale: string = 'fr-ML'
): string {
  if (currency === 'XOF' || currency === 'XAF') {
    // Format FCFA manually for better display
    const formatted = new Intl.NumberFormat('fr-FR').format(Math.round(amount))
    return `${formatted} FCFA`
  }
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ============================================================
// DATE FORMATTING
// ============================================================
export function formatDate(date: string | Date, pattern: string = 'dd/MM/yyyy'): string {
  return format(new Date(date), pattern, { locale: fr })
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd/MM/yyyy 'à' HH:mm", { locale: fr })
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr })
}

// ============================================================
// PHONE NUMBER FORMATTING
// ============================================================
export function formatPhone(phone: string, countryCode: string = 'ML'): string {
  const prefixes: Record<string, string> = {
    ML: '+223',
    SN: '+221',
    CI: '+225',
    BF: '+226',
    NE: '+227',
    GN: '+224',
    MR: '+222',
  }
  const prefix = prefixes[countryCode] || ''
  const clean = phone.replace(/\D/g, '')
  if (clean.startsWith('00')) return `+${clean.substring(2)}`
  if (clean.startsWith('+')) return clean
  return `${prefix}${clean}`
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return phone
  const start = phone.substring(0, 4)
  const end = phone.substring(phone.length - 2)
  const masked = '*'.repeat(phone.length - 6)
  return `${start}${masked}${end}`
}

// ============================================================
// OTP GENERATION
// ============================================================
export function generateOTP(length: number = 6): string {
  const digits = '0123456789'
  let otp = ''
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)]
  }
  return otp
}

// ============================================================
// BOOKING NUMBER
// ============================================================
export function generateBookingNumber(): string {
  const prefix = 'DT'
  const date = new Date()
  const year = date.getFullYear().toString().slice(-2)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.random().toString(36).substring(2, 7).toUpperCase()
  return `${prefix}${year}${month}${random}`
}

// ============================================================
// PRICING CALCULATION
// ============================================================
export interface PriceParams {
  basePrice: number
  distanceKm?: number
  pricePerKm?: number
  durationHours?: number
  pricePerHour?: number
  nbHandlers?: number
  handlerPricePerDay?: number
  isUrgent?: boolean
  commissionPercent?: number
  currency?: string
}

export function calculatePrice(params: PriceParams) {
  const {
    basePrice,
    distanceKm = 0,
    pricePerKm = 0,
    durationHours = 0,
    pricePerHour = 0,
    nbHandlers = 0,
    handlerPricePerDay = 15000,
    isUrgent = false,
    commissionPercent = 12,
    currency = 'XOF',
  } = params

  const distancePrice = distanceKm * pricePerKm
  const durationPrice = durationHours * pricePerHour
  const handlingFee = nbHandlers * handlerPricePerDay
  const subtotal = basePrice + distancePrice + durationPrice + handlingFee
  const urgencyFee = isUrgent ? subtotal * 0.15 : 0
  const subtotalWithUrgency = subtotal + urgencyFee
  const platformFee = subtotalWithUrgency * (commissionPercent / 100)
  const totalPrice = subtotalWithUrgency + platformFee

  return {
    basePrice,
    distancePrice,
    durationPrice,
    handlingFee,
    urgencyFee,
    platformFee: Math.round(platformFee),
    totalPrice: Math.round(totalPrice),
    ownerAmount: Math.round(subtotalWithUrgency),
    currency,
  }
}

// ============================================================
// STATUS COLORS & LABELS
// ============================================================
export function getBookingStatusColor(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'badge-muted',
    PENDING_OWNER_ACCEPTANCE: 'badge-warning',
    ACCEPTED: 'badge-primary',
    AWAITING_PAYMENT: 'badge-warning',
    PAYMENT_SECURED: 'badge-success',
    DRIVER_ASSIGNED: 'badge-primary',
    IN_PROGRESS: 'badge-accent',
    COMPLETED_PENDING_VALIDATION: 'badge-warning',
    COMPLETED: 'badge-success',
    CANCELLED_BY_CLIENT: 'badge-danger',
    CANCELLED_BY_OWNER: 'badge-danger',
    DISPUTED: 'badge-danger',
    REFUNDED: 'badge-muted',
    CLOSED: 'badge-muted',
  }
  return map[status] || 'badge-muted'
}

export function getTruckStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING_VALIDATION: 'badge-warning',
    VALIDATED: 'badge-success',
    SUSPENDED: 'badge-danger',
    REJECTED: 'badge-danger',
  }
  return map[status] || 'badge-muted'
}

export function getKYCStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: 'badge-muted',
    SUBMITTED: 'badge-warning',
    VERIFIED: 'badge-success',
    REJECTED: 'badge-danger',
  }
  return map[status] || 'badge-muted'
}

// ============================================================
// FILE SIZE FORMATTING
// ============================================================
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// ============================================================
// DISTANCE CALCULATION (haversine)
// ============================================================
export function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371 // km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

// ============================================================
// SLUG
// ============================================================
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// ============================================================
// TRUNCATE
// ============================================================
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength - 3) + '...'
}

// ============================================================
// INITIALS
// ============================================================
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}
