'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Truck, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// ============================================================
// SCHEMAS ZOD
// ============================================================
const registerSchema = z.object({
  firstName: z.string().min(2, 'Prénom requis (min 2 caractères)'),
  lastName: z.string().min(2, 'Nom requis (min 2 caractères)'),
  phone: z.string().min(8, 'Numéro de téléphone invalide').regex(/^\+?[0-9]{8,15}$/, 'Format invalide'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  password: z.string().min(6, 'Mot de passe: minimum 6 caractères'),
  confirmPassword: z.string(),
  role: z.enum(['CLIENT', 'TRUCK_OWNER', 'COMPANY', 'DRIVER']),
  agreeTerms: z.boolean().refine(val => val, 'Vous devez accepter les conditions'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

const loginSchema = z.object({
  identifier: z.string().min(3, 'Téléphone ou email requis'),
  password: z.string().min(1, 'Mot de passe requis'),
})

const otpSchema = z.object({
  code: z.string().length(6, 'Le code OTP doit contenir 6 chiffres'),
})

type RegisterData = z.infer<typeof registerSchema>
type LoginData = z.infer<typeof loginSchema>
type OtpData = z.infer<typeof otpSchema>

// ============================================================
// REGISTER FORM
// ============================================================
const roleOptions = [
  { value: 'CLIENT', label: '🧑 Particulier — Je cherche un camion', desc: 'Déménagement, transport' },
  { value: 'COMPANY', label: '🏢 Entreprise — Location régulière', desc: 'Contrats, flottes' },
  { value: 'TRUCK_OWNER', label: '🚛 Propriétaire — J\'ai des camions', desc: 'Inscrire mes véhicules' },
  { value: 'DRIVER', label: '👨‍✈️ Chauffeur — Je conduis', desc: 'Rattaché à un propriétaire' },
]

export function RegisterForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [step, setStep] = React.useState<'form' | 'otp'>('form')
  const [registeredPhone, setRegisteredPhone] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'CLIENT' },
  })

  const selectedRole = watch('role')

  const onSubmit = async (data: RegisterData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Erreur lors de l\'inscription')
        return
      }

      setRegisteredPhone(data.phone)
      setStep('otp')
      toast.success('Code OTP envoyé sur votre téléphone !')
    } catch {
      toast.error('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'otp') {
    return <OtpVerificationForm phone={registeredPhone} onSuccess={() => router.push('/accueil')} />
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Truck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text">Créer votre compte</h1>
        <p className="text-muted mt-1">Rejoignez DoniTalan gratuitement</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Role selection */}
        <div>
          <label className="label">Je suis...</label>
          <div className="grid grid-cols-2 gap-2">
            {roleOptions.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue('role', opt.value as RegisterData['role'])}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selectedRole === opt.value
                    ? 'border-accent bg-orange-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-semibold text-text">{opt.label}</div>
                <div className="text-xs text-muted mt-0.5">{opt.desc}</div>
              </button>
            ))}
          </div>
          {errors.role && <p className="error-text">{errors.role.message}</p>}
        </div>

        {/* Name */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Prénom"
            placeholder="Aminata"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Nom"
            placeholder="Coulibaly"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        {/* Phone */}
        <Input
          label="Téléphone *"
          placeholder="+223 70 00 00 00"
          type="tel"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.phone?.message}
          hint="Utilisé pour votre code OTP de vérification"
          {...register('phone')}
        />

        {/* Email (optional) */}
        <Input
          label="Email (optionnel)"
          placeholder="vous@exemple.com"
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />

        {/* Password */}
        <Input
          label="Mot de passe"
          placeholder="Minimum 6 caractères"
          type={showPassword ? 'text' : 'password'}
          error={errors.password?.message}
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...register('password')}
        />

        <Input
          label="Confirmer le mot de passe"
          placeholder="Répétez le mot de passe"
          type={showPassword ? 'text' : 'password'}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {/* Terms */}
        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 w-4 h-4 accent-accent"
              {...register('agreeTerms')}
            />
            <span className="text-sm text-muted">
              J'accepte les{' '}
              <Link href="/cgu" className="text-accent underline">conditions générales</Link>
              {' '}et la{' '}
              <Link href="/confidentialite" className="text-accent underline">politique de confidentialité</Link>
            </span>
          </label>
          {errors.agreeTerms && <p className="error-text">{errors.agreeTerms.message}</p>}
        </div>

        <Button type="submit" variant="accent" block loading={loading} size="lg">
          Créer mon compte
        </Button>

        <p className="text-center text-muted text-sm">
          Déjà inscrit ?{' '}
          <Link href="/connexion" className="text-accent font-semibold hover:underline">
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  )
}

// ============================================================
// LOGIN FORM
// ============================================================
export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Identifiants incorrects')
        return
      }

      toast.success('Connexion réussie ! Bienvenue 👋')

      // Redirect based on role
      const role = result.data?.role
      const redirectMap: Record<string, string> = {
        ADMIN: '/admin',
        SUPER_ADMIN: '/admin',
        TRUCK_OWNER: '/proprietaire',
        DRIVER: '/chauffeur',
        CLIENT: '/accueil',
        COMPANY: '/accueil',
      }
      router.push(redirectMap[role] || '/accueil')
    } catch {
      toast.error('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Truck className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-text">Bon retour !</h1>
        <p className="text-muted mt-1">Connectez-vous à votre compte DoniTalan</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Téléphone ou email"
          placeholder="+223 70 00 00 00"
          leftIcon={<Phone className="w-4 h-4" />}
          error={errors.identifier?.message}
          {...register('identifier')}
        />

        <Input
          label="Mot de passe"
          placeholder="Votre mot de passe"
          type={showPassword ? 'text' : 'password'}
          error={errors.password?.message}
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link href="/mot-de-passe-oublie" className="text-accent text-sm hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>

        <Button type="submit" variant="accent" block loading={loading} size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
          Se connecter
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-white px-4 text-sm text-muted">ou</span>
          </div>
        </div>

        <p className="text-center text-muted text-sm">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="text-accent font-semibold hover:underline">
            S'inscrire gratuitement
          </Link>
        </p>
      </form>
    </div>
  )
}

// ============================================================
// OTP VERIFICATION
// ============================================================
interface OtpVerificationProps {
  phone: string
  onSuccess: () => void
  purpose?: string
}

export function OtpVerificationForm({ phone, onSuccess, purpose = 'phone_verification' }: OtpVerificationProps) {
  const [loading, setLoading] = React.useState(false)
  const [resendLoading, setResendLoading] = React.useState(false)
  const [countdown, setCountdown] = React.useState(60)
  const [otpDigits, setOtpDigits] = React.useState(['', '', '', '', '', ''])
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([])

  const { handleSubmit } = useForm<OtpData>()

  // Countdown timer
  React.useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  const handleDigitChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return
    const newDigits = [...otpDigits]
    newDigits[index] = value
    setOtpDigits(newDigits)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, 6)
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''))
    }
  }

  const onSubmit = async () => {
    const code = otpDigits.join('')
    if (code.length !== 6) {
      toast.error('Entrez les 6 chiffres du code')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, purpose }),
      })
      const result = await res.json()

      if (!res.ok) {
        toast.error(result.error || 'Code incorrect')
        return
      }

      toast.success('Téléphone vérifié avec succès !')
      onSuccess()
    } catch {
      toast.error('Erreur réseau. Réessayez.')
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    setResendLoading(true)
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose }),
      })
      if (res.ok) {
        toast.success('Nouveau code envoyé !')
        setCountdown(60)
      }
    } catch {
      toast.error('Erreur lors de l\'envoi')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto text-center">
      <div className="text-5xl mb-4">📱</div>
      <h2 className="text-2xl font-bold text-text mb-2">Vérifiez votre téléphone</h2>
      <p className="text-muted mb-8">
        Entrez le code à 6 chiffres envoyé au{' '}
        <span className="font-semibold text-text">{phone}</span>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* OTP Input Boxes */}
        <div className="flex gap-3 justify-center" onPaste={handlePaste}>
          {otpDigits.map((digit, index) => (
            <input
              key={index}
              ref={el => { inputRefs.current[index] = el }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleDigitChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent focus:ring-opacity-20"
              style={{ borderColor: digit ? '#F97316' : '#E2E8F0' }}
              aria-label={`Chiffre ${index + 1}`}
            />
          ))}
        </div>

        <Button type="submit" variant="accent" block size="lg" loading={loading}>
          Vérifier le code
        </Button>
      </form>

      <div className="mt-6">
        {countdown > 0 ? (
          <p className="text-muted text-sm">
            Renvoyer dans <span className="font-semibold text-text">{countdown}s</span>
          </p>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={resendOtp}
            loading={resendLoading}
          >
            Renvoyer le code
          </Button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
          <p className="text-xs text-yellow-700 font-medium">
            🧪 Mode DEV: Code simulé dans la console serveur
          </p>
        </div>
      )}
    </div>
  )
}
