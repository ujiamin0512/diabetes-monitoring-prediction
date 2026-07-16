import { useEffect, useState } from 'react'
import { Badge } from '../components/Badge'
import { LoadingState } from '../components/LoadingState'
import { ProfileFields, isProfileFieldsValid, type ProfileFieldsValues } from '../components/ProfileFields'
import { ReadingModal } from '../components/ReadingModal'
import { InsightsPanel } from '../components/InsightsPanel'
import { computeBmi, updateMember } from '../lib/members'
import { listReadings } from '../lib/readings'
import { postRiskPrediction } from '../lib/api'
import type { InsightMessage, Member, Reading } from '../lib/types'

interface DailyLoggingScreenProps {
  member: Member
  onMemberUpdated: (member: Member) => void
  onSwitchUser: () => void
}

type ModalState = { mode: 'add' } | { mode: 'edit'; reading: Reading }

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning!'
  if (hour < 18) return 'Good afternoon!'
  return 'Good evening!'
}

function memberToValues(member: Member): ProfileFieldsValues {
  return {
    name: member.name,
    age: String(member.age),
    gender: member.gender,
    heightCm: String(member.height_cm),
    weightKg: String(member.weight_kg),
    hypertension: member.hypertension === 1 ? '1' : '0',
    heartDisease: member.heart_disease === 1 ? '1' : '0',
    smokingHistory: member.smoking_history,
    hba1c: String(member.hba1c_level),
  }
}

function formatReadingTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function DailyLoggingScreen({ member: initialMember, onMemberUpdated, onSwitchUser }: DailyLoggingScreenProps) {
  const [member, setMember] = useState(initialMember)
  const [profileValues, setProfileValues] = useState<ProfileFieldsValues>(() => memberToValues(initialMember))
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)

  const [readings, setReadings] = useState<Reading[]>([])
  const [readingsLoading, setReadingsLoading] = useState(true)
  const [readingsError, setReadingsError] = useState<string | null>(null)
  const [modalState, setModalState] = useState<ModalState | null>(null)

  const [predictLoading, setPredictLoading] = useState(false)
  const [predictAttempt, setPredictAttempt] = useState(1)
  const [messages, setMessages] = useState<InsightMessage[]>([])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setReadingsLoading(true)
      setReadingsError(null)
      try {
        const list = await listReadings(member.id)
        if (!cancelled) setReadings(list)
      } catch (err) {
        if (!cancelled) setReadingsError(err instanceof Error ? err.message : 'Could not load readings.')
      } finally {
        if (!cancelled) setReadingsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [member.id])

  function handleProfileChange<K extends keyof ProfileFieldsValues>(key: K, value: ProfileFieldsValues[K]) {
    setProfileValues((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSaveProfile() {
    if (
      !isProfileFieldsValid(profileValues) ||
      !profileValues.gender ||
      profileValues.hypertension === null ||
      profileValues.heartDisease === null ||
      profileValues.smokingHistory === ''
    ) {
      return
    }
    setProfileSaving(true)
    setProfileError(null)
    try {
      const bmi = computeBmi(Number(profileValues.heightCm), Number(profileValues.weightKg))
      const updated = await updateMember(member.id, {
        name: profileValues.name.trim(),
        age: Number(profileValues.age),
        gender: profileValues.gender,
        height_cm: Number(profileValues.heightCm),
        weight_kg: Number(profileValues.weightKg),
        bmi,
        hypertension: profileValues.hypertension === '1' ? 1 : 0,
        heart_disease: profileValues.heartDisease === '1' ? 1 : 0,
        smoking_history: profileValues.smokingHistory,
        hba1c_level: Number(profileValues.hba1c),
      })
      setMember(updated)
      setProfileValues(memberToValues(updated))
      onMemberUpdated(updated)
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not save profile.')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePredict() {
    if (readings.length === 0) return
    const latest = readings[0]
    setPredictLoading(true)
    setPredictAttempt(1)
    try {
      const response = await postRiskPrediction(
        {
          age: member.age,
          hypertension: member.hypertension,
          heart_disease: member.heart_disease,
          bmi: member.bmi,
          HbA1c_level: member.hba1c_level,
          blood_glucose_level: latest.blood_glucose_level,
          gender: member.gender,
          smoking_history: member.smoking_history,
        },
        (attempt) => setPredictAttempt(attempt),
      )
      setMessages((prev) => [
        {
          id: crypto.randomUUID(),
          kind: 'prediction',
          createdAt: new Date().toISOString(),
          riskTier: response.risk_tier,
          explanation: response.explanation,
          diabetesResult: response.diabetes_result,
          diabetesProbability: response.diabetes_probability,
        },
        ...prev,
      ])
    } catch (err) {
      setMessages((prev) => [
        {
          id: crypto.randomUUID(),
          kind: 'error',
          createdAt: new Date().toISOString(),
          message: err instanceof Error ? err.message : 'Could not complete risk assessment.',
        },
        ...prev,
      ])
    } finally {
      setPredictLoading(false)
    }
  }

  function handleReadingSaved(reading: Reading, insight: InsightMessage | null) {
    setReadings((prev) => {
      const idx = prev.findIndex((r) => r.id === reading.id)
      if (idx === -1) return [reading, ...prev]
      const copy = [...prev]
      copy[idx] = reading
      return copy
    })
    if (insight) setMessages((prev) => [insight, ...prev])
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col gap-6 px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-[var(--color-text)]">
          {getGreeting()} Let's record {member.name}'s glucose.
        </h1>
        <button
          type="button"
          onClick={onSwitchUser}
          className="whitespace-nowrap text-xl font-semibold text-[var(--color-muted)] underline"
        >
          Switch User
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(260px,300px)_minmax(380px,1fr)_minmax(380px,460px)] lg:items-start">
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={handlePredict}
            disabled={readings.length === 0 || predictLoading}
            className="min-h-20 rounded-2xl bg-[var(--color-primary)] px-6 text-2xl font-bold text-white shadow-sm disabled:opacity-50"
          >
            {predictLoading
              ? predictAttempt > 1
                ? `Waking up service (try ${predictAttempt})...`
                : 'Predicting...'
              : 'Predict'}
          </button>
          {readings.length === 0 && !readingsLoading && (
            <p className="text-lg text-[var(--color-muted)]">Add a reading first to run a prediction.</p>
          )}

          <div className="flex flex-col gap-4 rounded-2xl border-2 border-gray-200 bg-[var(--color-surface)] p-6">
            <h2 className="text-2xl font-bold text-[var(--color-text)]">Profile</h2>
            <ProfileFields values={profileValues} onChange={handleProfileChange} idPrefix="sidebar-profile" />
            {profileError && <p className="text-lg font-semibold text-[var(--color-danger)]">{profileError}</p>}
            <button
              type="button"
              disabled={!isProfileFieldsValid(profileValues) || profileSaving}
              onClick={handleSaveProfile}
              className="min-h-16 rounded-2xl bg-[var(--color-primary)] px-6 text-xl font-bold text-white shadow-sm disabled:opacity-50"
            >
              {profileSaving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:border-l-2 lg:border-gray-200 lg:pl-6">
          <button
            type="button"
            onClick={() => setModalState({ mode: 'add' })}
            className="min-h-20 rounded-2xl bg-[var(--color-primary)] px-6 text-2xl font-bold text-white shadow-sm"
          >
            + Add Reading
          </button>

          {readingsLoading && <LoadingState message="Loading readings..." />}
          {readingsError && <p className="text-lg font-semibold text-[var(--color-danger)]">{readingsError}</p>}
          {!readingsLoading && readings.length === 0 && (
            <p className="text-center text-lg text-[var(--color-muted)]">No readings yet. Add one to get started.</p>
          )}

          <div className="flex flex-col gap-3">
            {readings.map((reading) => (
              <button
                key={reading.id}
                type="button"
                onClick={() => setModalState({ mode: 'edit', reading })}
                className="flex flex-col gap-1 rounded-2xl border-2 border-gray-200 bg-[var(--color-surface)] p-5 text-left"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-2xl font-bold text-[var(--color-text)]">
                    {reading.blood_glucose_level} mg/dL
                  </span>
                  <Badge tone={reading.result === 'normal' ? 'success' : 'danger'}>
                    {reading.result === 'normal' ? 'Normal' : reading.result === 'abnormal_high' ? 'High' : 'Low'}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-lg text-[var(--color-muted)]">
                  <span>
                    {reading.timing === 'before_meal' ? 'Before Meal' : 'After Meal'} &middot;{' '}
                    {reading.meds_taken ? 'Meds Taken' : 'No Meds'}
                  </span>
                  <span className="whitespace-nowrap">{formatReadingTime(reading.created_at)}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:border-l-2 lg:border-gray-200 lg:pl-6">
          <div className="flex min-h-20 items-center justify-center rounded-2xl bg-[var(--color-primary)] px-6 text-center text-2xl font-bold text-white shadow-sm">
            Insights &amp; Alerts
          </div>
          <div className="rounded-2xl border-2 border-gray-200 bg-[var(--color-surface)] p-6">
            <InsightsPanel messages={messages} />
          </div>
        </div>
      </div>

      {modalState && (
        <ReadingModal
          ownerId={member.owner_id}
          memberId={member.id}
          mode={modalState.mode}
          initialReading={modalState.mode === 'edit' ? modalState.reading : undefined}
          onClose={() => setModalState(null)}
          onSaved={handleReadingSaved}
        />
      )}
    </div>
  )
}
