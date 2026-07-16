interface NumericInputProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoFocus?: boolean
  placeholder?: string
}

export function NumericInput({ id, label, value, onChange, autoFocus, placeholder }: NumericInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-2xl font-semibold text-[var(--color-text)]">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        autoFocus={autoFocus}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-h-16 rounded-2xl border-2 border-gray-300 bg-[var(--color-surface)] px-6 text-center text-5xl font-bold text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
      />
    </div>
  )
}
