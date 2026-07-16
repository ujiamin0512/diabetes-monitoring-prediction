import { useState } from 'react'
import { Modal } from './Modal'
import { NumericInput } from './NumericInput'
import { ToggleGroup } from './ToggleGroup'
import { classifyReading } from '../lib/ada'
import { insertReading, updateReading } from '../lib/readings'
import { postDailyAnalysis } from '../lib/api'
import type { InsightMessage, Reading, Timing } from '../lib/types'

interface ReadingModalProps {
  ownerId: string
  memberId: string
  mode: 'add' | 'edit'
  initialReading?: Reading
  onClose: () => void
  onSaved: (reading: Reading, insight: InsightMessage | null) => void
}

export function ReadingModal({ ownerId, memberId, mode, initialReading, onClose, onSaved }: ReadingModalProps) {
  const [glucose, setGlucose] = useState(initialReading ? String(initialReading.blood_glucose_level) : '')
  const [timing, setTiming] = useState<Timing | null>(initialReading?.timing ?? null)
  const [medsTaken, setMedsTaken] = useState<'1' | '0' | null>(
    initialReading ? (initialReading.meds_taken === 1 ? '1' : '0') : null,
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = glucose.trim().length > 0 && timing !== null && medsTaken !== null

  async function handleSave() {
    if (!isValid || timing === null || medsTaken === null) return
    setSaving(true)
    setError(null)

    const glucoseNumber = Number(glucose)
    const meds = medsTaken === '1' ? 1 : 0
    const classified = classifyReading(glucoseNumber, timing)

    try {
      const savedReading =
        mode === 'add'
          ? await insertReading({
              member_id: memberId,
              owner_id: ownerId,
              blood_glucose_level: glucoseNumber,
              timing,
              meds_taken: meds,
              result: classified,
            })
          : await updateReading(initialReading!.id, {
              blood_glucose_level: glucoseNumber,
              timing,
              meds_taken: meds,
              result: classified,
            })

      let insight: InsightMessage | null = null
      if (classified !== 'normal') {
        try {
          const response = await postDailyAnalysis({
            blood_glucose_level: glucoseNumber,
            timing,
            meds_taken: meds,
            result: classified,
          })
          insight = {
            id: crypto.randomUUID(),
            kind: 'abnormal',
            createdAt: new Date().toISOString(),
            badgeLabel: classified === 'abnormal_high' ? 'High' : 'Low',
            explanation: response.explanation,
          }
        } catch {
          insight = {
            id: crypto.randomUUID(),
            kind: 'error',
            createdAt: new Date().toISOString(),
            message: 'Could not analyze this reading right now.',
          }
        }
      }

      onSaved(savedReading, insight)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this reading.')
      setSaving(false)
    }
  }

  return (
    <Modal title={mode === 'add' ? 'Add Reading' : 'Edit Reading'} onClose={onClose}>
      <NumericInput id="reading-glucose" label="Blood Glucose (mg/dL)" value={glucose} onChange={setGlucose} autoFocus />

      <ToggleGroup
        label="Timing"
        value={timing}
        onChange={setTiming}
        options={[
          { label: 'Before Meal', value: 'before_meal' },
          { label: 'After Meal', value: 'after_meal' },
        ]}
      />

      <ToggleGroup
        label="Medication Taken?"
        value={medsTaken}
        onChange={setMedsTaken}
        options={[
          { label: 'Taken', value: '1' },
          { label: 'Not Taken', value: '0' },
        ]}
      />

      {error && <p className="text-xl font-semibold text-[var(--color-danger)]">{error}</p>}

      <button
        type="button"
        disabled={!isValid || saving}
        onClick={handleSave}
        className="min-h-16 rounded-2xl bg-[var(--color-primary)] px-6 text-2xl font-bold text-white shadow-sm disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save Reading'}
      </button>
    </Modal>
  )
}
