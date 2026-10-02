'use client'

import { useState } from 'react'
import styles from './ExpandableText.module.sass'

/** Two lines of text with "See more" */
const ExpandableText = ({ text }: { text: string }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className={styles.wrap}>
      <p className={expanded ? styles.expanded : styles.clamped}>{text}</p>
      <button type="button" onClick={() => setExpanded(!expanded)}>
        {expanded ? 'See less' : 'See more'}
      </button>
    </div>
  )
}

export default ExpandableText
