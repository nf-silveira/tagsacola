import { FiGithub } from 'react-icons/fi'

import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <p>
        <span>
          © 2026{' '}
          <a className={styles.brandLink} href="#topo">
            Tag Sacola
          </a>
        </span>
        <span aria-hidden="true">·</span>
        <span>
          Desenvolvido por{' '}
          <a
            className={styles.link}
            href="https://github.com/nf-silveira/tagsacola"
            target="_blank"
            rel="noreferrer"
          >
            <FiGithub aria-hidden="true" />
            Nelson Felipe
          </a>
        </span>
      </p>
    </footer>
  )
}
