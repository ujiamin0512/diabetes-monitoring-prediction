import { NumericInput } from './NumericInput'
import { ToggleGroup } from './ToggleGroup'
import type { Gender, SmokingHistory } from '../lib/types'

export interface ProfileFieldsValues {
  name: string
  age: string
  gender: Gender | null
  heightCm: string
  weightKg: string
  hypertension: '1' | '0' | null
  heartDisease: '1' | '0' | null
  smokingHistory: SmokingHistory | ''
  hba1c: string
}

const SMOKING_OPTIONS: { label: string; value: SmokingHistory }[] = [
  { label: 'Never smoked', value: 'never' },
  { label: 'Former smoker', value: 'former' },
  { label: 'Current smoker', value: 'current' },
  { label: 'Smoked occasionally (ever)', value: 'ever' },
  { label: 'Not currently smoking', value: 'not current' },
  { label: 'Prefer not to say', value: 'No Info' },
]

interface ProfileFieldsProps {
  values: ProfileFieldsValues
  onChange: <K extends keyof ProfileFieldsValues>(key: K, value: ProfileFieldsValues[K]) => void
  idPrefix?: string
}

export function isProfileFieldsValid(values: ProfileFieldsValues): boolean {
  return (
    values.name.trim().length > 0 &&
    values.age.trim().length > 0 &&
    values.gender !== null &&
    values.heightCm.trim().length > 0 &&
    values.weightKg.trim().length > 0 &&
    values.hypertension !== null &&
    values.heartDisease !== null &&
    values.smokingHistory !== '' &&
    values.hba1c.trim().length > 0
  )
}

export function ProfileFields({ values, onChange, idPrefix = 'profile' }: ProfileFieldsProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-name`} className="text-2xl font-semibold text-[var(--color-text)]">
          Name
        </label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          value={values.name}
          onChange={(e) => onChange('name', e.target.value)}
          className="min-h-16 rounded-2xl border-2 border-gray-300 bg-[var(--color-surface)] px-6 text-3xl font-bold text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      <NumericInput id={`${idPrefix}-age`} label="Age" value={values.age} onChange={(v) => onChange('age', v)} />

      <ToggleGroup
        label="Gender"
        value={values.gender}
        onChange={(v) => onChange('gender', v)}
        options={[
          { label: 'Male', value: 'Male' },
          { label: 'Female', value: 'Female' },
        ]}
      />

      <NumericInput
        id={`${idPrefix}-height`}
        label="Height (cm)"
        value={values.heightCm}
        onChange={(v) => onChange('heightCm', v)}
      />
      <NumericInput
        id={`${idPrefix}-weight`}
        label="Weight (kg)"
        value={values.weightKg}
        onChange={(v) => onChange('weightKg', v)}
      />

      <ToggleGroup
        label="Hypertension"
        value={values.hypertension}
        onChange={(v) => onChange('hypertension', v)}
        options={[
          { label: 'Yes', value: '1' },
          { label: 'No', value: '0' },
        ]}
      />

      <ToggleGroup
        label="Heart Disease"
        value={values.heartDisease}
        onChange={(v) => onChange('heartDisease', v)}
        options={[
          { label: 'Yes', value: '1' },
          { label: 'No', value: '0' },
        ]}
      />

      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-smoking`} className="text-2xl font-semibold text-[var(--color-text)]">
          Smoking History
        </label>
        <select
          id={`${idPrefix}-smoking`}
          value={values.smokingHistory}
          onChange={(e) => onChange('smokingHistory', e.target.value as SmokingHistory)}
          className="min-h-16 rounded-2xl border-2 border-gray-300 bg-[var(--color-surface)] px-6 text-2xl font-bold text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none"
        >
          <option value="" disabled>
            Select one
          </option>
          {SMOKING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <NumericInput
        id={`${idPrefix}-hba1c`}
        label="Latest HbA1c"
        value={values.hba1c}
        onChange={(v) => onChange('hba1c', v)}
        placeholder="e.g. 6.3"
      />
    </div>
  )
}
