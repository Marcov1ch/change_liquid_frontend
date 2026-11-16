import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface LegalPageProps {
  title: string
  updatedAt: string
  children: ReactNode
}

interface LegalSectionProps {
  title: string
  children: ReactNode
}

export function LegalPage({ title, updatedAt, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-outline-variant bg-surface">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <Link to="/" className="text-title-md text-primary no-underline">ChangeLiquid</Link>
          <Link to="/" className="text-label-lg text-primary hover:underline underline-offset-2">На главную</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-headline-sm text-surface-on m-0 mb-2">{title}</h1>
        <p className="text-body-sm text-outline mb-8">Дата последнего обновления: {updatedAt}</p>
        <div className="flex flex-col gap-6 text-body-md text-surface-on">{children}</div>
      </main>
    </div>
  )
}

export function LegalSection({ title, children }: LegalSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-title-md text-surface-on m-0">{title}</h2>
      <div className="flex flex-col gap-2 text-body-md text-surface-on">{children}</div>
    </section>
  )
}
