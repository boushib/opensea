import type { Metadata } from 'next'
import CreateForm from '@/components/create/CreateForm'
import styles from '@/components/create/Create.module.sass'

export const metadata: Metadata = { title: 'Create a collection' }

export default function Create() {
  return (
    <div className="container">
      <header className={styles.header}>
        <h1>Create a collection</h1>
        <p>Name it, pick an art style and choose how many items it has. Every item is generated from the style, and you mint them into your wallet.</p>
      </header>
      <CreateForm />
    </div>
  )
}
