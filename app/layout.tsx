import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Providers } from '@/components/wallet/WalletProvider'
import { getCollections } from '@/lib/catalog'
import type { SearchCollection } from '@/lib/searchIndex'
import { artUrl } from '@/lib/urls'
import './globals.scss'

const sans = Geist({ subsets: ['latin'], variable: '--font-sans' })
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: { default: 'OpenSea clone', template: '%s | OpenSea clone' },
  description: 'Discover, collect and trade NFTs. A marketplace clone built with Next.js.',
}

// Saved choice, or the system setting, applied before the first paint
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`

export default function RootLayout({ children }: LayoutProps<'/'>) {
  // A small index for instant search suggestions in the header
  const searchIndex: SearchCollection[] = getCollections().map((c) => ({ slug: c.slug, name: c.name, avatar: artUrl(c.slug, c.featured), verified: c.verified, size: c.size, floor: c.stats.floor }))
  return (
    <html lang="en" data-theme="light" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        {/* Runs on the server-rendered page only; as text/plain on the client React doesn't warn about it */}
        <script type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>
          <Header collections={searchIndex} />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
