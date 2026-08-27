import type { Metadata } from 'next'
import { Playfair_Display, Rubik } from 'next/font/google'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { ThemeProvider } from 'next-themes'

import { GuestHeaderControls } from '@/components/guest-header-controls'
import { HeaderBrandLink } from '@/components/header-brand-link'
import { HeaderPageTitle } from '@/components/header-page-title'
import { UserMenu } from '@/components/user-menu/user-menu'
import { AuthProvider } from '@/contexts/auth-context'
import { routing } from '@/i18n/routing'
import '../globals.css'

const playfairDisplay = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
})

const rubik = Rubik({
  variable: '--font-rubik',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export const metadata: Metadata = {
  title: 'Cobuccio Wallet',
  description: 'Cobuccio Wallet',
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${playfairDisplay.variable} ${rubik.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider>
            <AuthProvider>
              <header className="flex h-16 bg-navy text-white">
                <div className="flex shrink-0 items-center px-4 py-3 sm:w-56 sm:border-r sm:border-white/15">
                  <HeaderBrandLink />
                </div>
                <div className="flex flex-1 items-center gap-4 px-4 py-3">
                  <HeaderPageTitle />
                  <div className="ml-auto flex items-center gap-2">
                    <GuestHeaderControls />
                    <UserMenu />
                  </div>
                </div>
              </header>
              {children}
            </AuthProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
