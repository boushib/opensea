import Link from 'next/link'
import Logo from './Logo'
import styles from './Footer.module.sass'

const COLUMNS = [
  {
    title: 'Marketplace',
    links: [
      { href: '/explore', label: 'All collections' },
      { href: '/explore/art', label: 'Art' },
      { href: '/explore/gaming', label: 'Gaming' },
      { href: '/explore/pfps', label: 'Profile pictures' },
    ],
  },
  {
    title: 'Stats',
    links: [
      { href: '/rankings', label: 'Rankings' },
      { href: '/rankings?sort=change', label: 'Top movers' },
    ],
  },
  {
    title: 'My account',
    links: [
      { href: '/account', label: 'Profile' },
      { href: '/account?tab=favorites', label: 'Favorites' },
      { href: '/account?tab=offers', label: 'My offers' },
    ],
  },
]

const Footer = () => (
  <footer className={styles.footer}>
    <div className={`container ${styles.inner}`}>
      <div className={styles.brand}>
        <Logo />
        <p>A clone of the OpenSea NFT marketplace for learning purposes. Collections, items and prices are demo data; the wallet connects to the Sepolia test network.</p>
      </div>
      {COLUMNS.map((c) => (
        <div key={c.title} className={styles.column}>
          <h3>{c.title}</h3>
          <ul>
            {c.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div className={`container ${styles.bottom}`}>
      <span>© {new Date().getFullYear()} El Hassane Boushib · Not affiliated with OpenSea</span>
      <a href="https://github.com/boushib/opensea" target="_blank" rel="noreferrer">
        Source on GitHub
      </a>
    </div>
  </footer>
)

export default Footer
