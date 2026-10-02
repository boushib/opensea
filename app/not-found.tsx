import Link from 'next/link'
import styles from '@/components/explore/Search.module.sass'

export default function NotFound() {
  return (
    <div className="container" style={{ padding: '96px 16px', textAlign: 'center' }}>
      <p className="mono" style={{ fontSize: 64, fontWeight: 700, color: 'var(--accent)' }}>
        404
      </p>
      <h1 style={{ fontSize: 30, margin: '8px 0' }}>This page is not on the blockchain</h1>
      <p className={styles.hint}>The collection or item may not exist, or the link is wrong.</p>
      <p style={{ marginTop: 24 }}>
        <Link href="/explore" style={{ padding: '12px 22px', borderRadius: 12, color: 'var(--on-accent)', fontWeight: 700, backgroundColor: 'var(--accent)' }}>
          Explore collections
        </Link>
      </p>
    </div>
  )
}
