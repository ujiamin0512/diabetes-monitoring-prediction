interface ToggleOption<T extends string> {
  label: string
  value: T
}

interface ToggleGroupProps<T extends string> {
  label: string
  options: ToggleOption<T>[]
  value: T | null
  onChange: (value: T) => void
}

export function ToggleGroup<T extends string>({ label, options, value, onChange }: ToggleGroupProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-2xl font-semibold text-[var(--color-text)]">{label}</span>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => {
          const selected = value === option.value
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`min-h-16 rounded-2xl border-2 text-2xl font-bold transition-colors ${
                selected
                  ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
                  : 'border-gray-300 bg-[var(--color-surface)] text-[var(--color-text)]'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
