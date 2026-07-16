export type BadgeTone = 'success' | 'danger' | 'warning'

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
}

interface BadgeProps {
  tone: BadgeTone
  children: React.ReactNode
}

export function Badge({ tone, children }: BadgeProps) {
  return (
    <span className={`inline-block rounded-full px-6 py-2 text-2xl font-bold ${TONE_CLASSES[tone]}`}>
      {children}
    </span>
  )
}
