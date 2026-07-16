import type { ReadingResult, Timing } from './types'

const RANGES: Record<Timing, { min: number; max: number }> = {
  before_meal: { min: 80, max: 130 },
  after_meal: { min: 80, max: 180 },
}

export function classifyReading(bloodGlucoseLevel: number, timing: Timing): ReadingResult {
  const { min, max } = RANGES[timing]
  if (bloodGlucoseLevel < min) return 'abnormal_low'
  if (bloodGlucoseLevel > max) return 'abnormal_high'
  return 'normal'
}
