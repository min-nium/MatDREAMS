import type { ReactNode } from 'react'

interface PlaceholderPageProps {
  title: string
  children: ReactNode
}

export function PlaceholderPage({ title, children }: PlaceholderPageProps) {
  return (
    <article>
      <h1>{title}</h1>
      <p className="placeholder-label">Initialization placeholder</p>
      {children}
    </article>
  )
}
