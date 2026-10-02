'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Verified from '@/components/ui/Verified'
import styles from './Featured.module.sass'

export type Slide = {
  slug: string
  name: string
  creator: string
  verified: boolean
  avatar: string
  tiles: string[]
  stats: Array<{ label: string; value: string }>
}

/** Featured collections, one at a time, with arrows and dots */
const Featured = ({ slides }: { slides: Slide[] }) => {
  const [index, setIndex] = useState(0)
  const go = (i: number) => setIndex((i + slides.length) % slides.length)

  return (
    <section className={styles.featured} aria-roledescription="carousel" aria-label="Featured collections">
      <div className={styles.track} style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div key={s.slug} className={styles.slide} aria-hidden={i !== index}>
            <div className={styles.mosaic}>
              {s.tiles.map((src, t) => (
                <img key={t} src={src} alt="" loading={i === 0 ? 'eager' : 'lazy'} />
              ))}
            </div>
            <div className={styles.info}>
              <img src={s.avatar} alt="" className={styles.avatar} />
              <div className={styles.title}>
                <h2>
                  {s.name} {s.verified && <Verified size={22} />}
                </h2>
                <p>By {s.creator}</p>
              </div>
              <dl className={styles.stats}>
                {s.stats.map((st) => (
                  <div key={st.label}>
                    <dt>{st.label}</dt>
                    <dd className="mono">{st.value}</dd>
                  </div>
                ))}
              </dl>
              <Link href={`/collection/${s.slug}`} className={styles.cta} tabIndex={i === index ? 0 : -1}>
                View collection
              </Link>
            </div>
          </div>
        ))}
      </div>
      <button type="button" className={`${styles.arrow} ${styles.prev}`} onClick={() => go(index - 1)} aria-label="Previous collection">
        <ChevronLeft size={20} />
      </button>
      <button type="button" className={`${styles.arrow} ${styles.next}`} onClick={() => go(index + 1)} aria-label="Next collection">
        <ChevronRight size={20} />
      </button>
      <div className={styles.dots}>
        {slides.map((s, i) => (
          <button key={s.slug} type="button" className={i === index ? styles.dotActive : ''} onClick={() => go(i)} aria-label={`Show ${s.name}`} aria-current={i === index} />
        ))}
      </div>
    </section>
  )
}

export default Featured
