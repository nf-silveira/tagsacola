import { FiTag } from 'react-icons/fi'

import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.screen}>
      <section className={styles.card}>
        <span className={styles.iconBadge} aria-hidden="true">
          <FiTag size={30} />
        </span>

        <h1 className={styles.title}>
          Tag <span className={styles.highlight}>Sacola</span>
        </h1>

        <p className={styles.slogan}>
          Sua solução de etiquetas sempre que precisar!
        </p>

        <p className={styles.description}>
          Ferramenta operacional de contingência para gerar, visualizar e
          imprimir etiquetas de identificação de sacolas na separação de
          compras.
        </p>
      </section>
    </main>
  )
}
