interface LoadingStateProps {
  message: string
}

export function LoadingState({ message }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-[var(--color-primary)]" />
      <p className="text-2xl font-semibold text-[var(--color-muted)]">{message}</p>
    </div>
  )
}
