import type { ReactNode } from 'react'

interface PlaceholderPageProps {
  title: string
  children: ReactNode
}

export function PlaceholderPage({ title, children }: PlaceholderPageProps) {
  return (
    <article className="page">
      <span className="label page__eyebrow placeholder-label">Initialization placeholder</span>
      <h1 className="page__title">{title}</h1>
      <hr className="page__rule" />
      <div className="page__body">{children}</div>
    </article>
  )
}
