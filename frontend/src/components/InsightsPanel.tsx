import { Badge } from './Badge'
import { describeDiabetesResult } from '../lib/api'
import type { InsightMessage } from '../lib/types'

interface InsightsPanelProps {
  messages: InsightMessage[]
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function InsightCard({ message }: { message: InsightMessage }) {
  if (message.kind === 'abnormal') {
    return (
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-gray-200 bg-[var(--color-surface)] p-6">
        <div className="flex items-center justify-between">
          <Badge tone="danger">{message.badgeLabel}</Badge>
          <span className="text-lg text-[var(--color-muted)]">{formatTime(message.createdAt)}</span>
        </div>
        <p className="text-xl leading-relaxed text-[var(--color-text)]">{message.explanation}</p>
      </div>
    )
  }

  if (message.kind === 'prediction') {
    const tone = message.riskTier === 'high' ? 'danger' : message.riskTier === 'watch' ? 'warning' : 'success'
    return (
      <div className="flex flex-col gap-3 rounded-2xl border-2 border-gray-200 bg-[var(--color-surface)] p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge tone={tone}>{message.riskTier.toUpperCase()}</Badge>
          <span className="text-lg text-[var(--color-muted)]">{formatTime(message.createdAt)}</span>
        </div>
        <p className="text-xl leading-relaxed text-[var(--color-text)]">{message.explanation}</p>
        <div className="flex flex-col gap-1 border-t-2 border-gray-100 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-lg font-semibold text-[var(--color-muted)]">Model Prediction</span>
            <span className="text-lg font-bold text-[var(--color-text)]">
              {describeDiabetesResult(message.diabetesResult)}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-lg font-semibold text-[var(--color-muted)]">Probability</span>
            <span className="text-lg font-bold text-[var(--color-text)]">
              {Math.round(message.diabetesProbability * 100)}%
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-2xl border-2 border-gray-200 bg-[var(--color-surface)] p-6">
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-[var(--color-danger)]">Error</span>
        <span className="text-lg text-[var(--color-muted)]">{formatTime(message.createdAt)}</span>
      </div>
      <p className="text-xl leading-relaxed text-[var(--color-text)]">{message.message}</p>
    </div>
  )
}

export function InsightsPanel({ messages }: InsightsPanelProps) {
  if (messages.length === 0) {
    return <p className="text-xl text-[var(--color-muted)]">No insights yet.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <InsightCard key={message.id} message={message} />
      ))}
    </div>
  )
}
