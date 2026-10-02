'use client'

import { Moon, Sun } from 'lucide-react'
import styles from './Header.module.sass'

/** Flips between light and dark and remembers the choice */
const ThemeToggle = () => {
  const toggle = () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('theme', next)
    } catch {}
  }

  return (
    <button type="button" className={styles.iconButton} onClick={toggle} aria-label="Switch between light and dark theme">
      {/* Both icons render; CSS shows the one for the current theme, so nothing flashes */}
      <Sun size={18} className={styles.sun} />
      <Moon size={18} className={styles.moon} />
    </button>
  )
}

export default ThemeToggle
