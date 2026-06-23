import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: {
    default: 'DoniTalan — Transport de charge & Location de camions au Mali',
    template: '%s | DoniTalan',
  },
  description: 'Trouvez le camion idéal pour votre déménagement, transport de marchandises ou location à Bamako et au Mali. Réservez en ligne, payez avec Orange Money ou Wave.',
  keywords: ['camion', 'transport', 'déménagement', 'Bamako', 'Mali', 'location camion', 'Orange Money', 'Wave'],
  authors: [{ name: 'DoniTalan' }],
  creator: 'DoniTalan',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DoniTalan',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_ML',
    siteName: 'DoniTalan',
    title: 'DoniTalan — Transport de charge au Mali',
    description: 'Plateforme de transport et location de camions en Afrique de l\'Ouest',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#1A3A5C',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1E293B',
              color: '#F8FAFC',
              borderRadius: '12px',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              fontWeight: '500',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#22C55E', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  )
}
