import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'

import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Tag Sacola — Sua solução de etiquetas sempre que precisar!',
    template: '%s | Tag Sacola',
  },
  description:
    'Crie, visualize e imprima etiquetas de identificação de sacolas para a separação de compras do supermercado, com funcionamento offline.',
  applicationName: 'Tag Sacola',
  icons: {
    icon: '/favicon.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#5940C8',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
