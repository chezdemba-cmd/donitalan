import { LoginForm } from '@/components/forms/AuthForms'
import Link from 'next/link'
import { Truck } from 'lucide-react'

export default function ConnexionPage() {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="py-4 px-6 border-b border-slate-100 bg-white">
        <Link href="/accueil" className="flex items-center gap-2 font-bold text-xl w-fit">
          <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
            <Truck className="w-4 h-4 text-white" />
          </div>
          <span className="gradient-text">DoniTalan</span>
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-card p-8 animate-slide-up">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
