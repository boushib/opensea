'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search as SearchIcon, X } from 'lucide-react'
import Logo from './Logo'
import Search from './Search'
import type { SearchCollection } from '@/lib/searchIndex'
import ThemeToggle from './ThemeToggle'
import WalletButton from '@/components/wallet/WalletButton'
import Notifications from '@/components/wallet/Notifications'
import styles from './Header.module.sass'

const LINKS = [
  { href: '/explore', label: 'Explore' },
  { href: '/rankings', label: 'Rankings' },
]

const Header = ({ collections }: { collections: SearchCollection[] }) => {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  // Close the mobile menu after navigating
  const [path, setPath] = useState(pathname)
  if (path !== pathname) {
    setPath(pathname)
    setOpen(false)
  }

  return (
    <header className={styles.header}>
      <div className={`container ${styles.inner}`}>
        <Logo />
        <nav className={`${styles.nav} ${open ? styles.navOpen : ''}`} aria-label="Main">
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={pathname.startsWith(href) ? styles.active : ''}>
              {label}
            </Link>
          ))}
          {/* On small phones the theme switch lives in the menu */}
          <div className={styles.menuTheme}>
            <span>Theme</span>
            <ThemeToggle />
          </div>
        </nav>
        <Search collections={collections} />
        <div className={styles.actions}>
          <Link href="/search" className={`${styles.iconButton} ${styles.searchButton}`} aria-label="Search">
            <SearchIcon size={18} />
          </Link>
          <span className={styles.headerTheme}>
            <ThemeToggle />
          </span>
          <Notifications />
          <WalletButton />
          <button type="button" className={`${styles.iconButton} ${styles.menuButton}`} onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
