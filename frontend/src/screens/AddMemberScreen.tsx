import { useState } from 'react'
import { ProfileFields, isProfileFieldsValid, type ProfileFieldsValues } from '../components/ProfileFields'
import { addMember, computeBmi } from '../lib/members'
import type { Member } from '../lib/types'

interface AddMemberScreenProps {
  ownerId: string
  onCreated: (member: Member) => void
  onCancel: () => void
}

const EMPTY_VALUES: ProfileFieldsValues = {
  name: '',
  age: '',
  gender: null,
  heightCm: '',
  weightKg: '',
  hypertension: null,
  heartDisease: null,
  smokingHistory: '',
  hba1c: '',
}

export function AddMemberScreen({ ownerId, onCreated, onCancel }: AddMemberScreenProps) {
  const [values, setValues] = useState<ProfileFieldsValues>(EMPTY_VALUES)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange<K extends keyof ProfileFieldsValues>(key: K, value: ProfileFieldsValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const isValid = isProfileFieldsValid(values)

  async function handleSave() {
    if (
      !isValid ||
      !values.gender ||
      values.hypertension === null ||
      values.heartDisease === null ||
      values.smokingHistory === ''
    ) {
      return
    }
    setSaving(true)
    setError(null)
    try {
      const bmi = computeBmi(Number(values.heightCm), Number(values.weightKg))
      const member = await addMember(ownerId, {
        name: values.name.trim(),
        age: Number(values.age),
        gender: values.gender,
        height_cm: Number(values.heightCm),
        weight_kg: Number(values.weightKg),
        bmi,
        hypertension: values.hypertension === '1' ? 1 : 0,
        heart_disease: values.heartDisease === '1' ? 1 : 0,
        smoking_history: values.smokingHistory,
        hba1c_level: Number(values.hba1c),
      })
      onCreated(member)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-6 py-10">
      <h1 className="text-center text-4xl font-bold text-[var(--color-text)]">Add a Person</h1>

      <ProfileFields values={values} onChange={handleChange} idPrefix="add-member" />

      {error && <p className="text-xl font-semibold text-[var(--color-danger)]">{error}</p>}

      <div className="flex flex-col gap-3 pt-4">
        <button
          type="button"
          disabled={!isValid || saving}
          onClick={handleSave}
          className="min-h-20 rounded-2xl bg-[var(--color-primary)] px-6 text-3xl font-bold text-white shadow-sm disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="min-h-16 rounded-2xl border-2 border-gray-300 px-6 text-2xl font-bold text-[var(--color-muted)]"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
