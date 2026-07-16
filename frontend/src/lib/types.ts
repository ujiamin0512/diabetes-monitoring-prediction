export type Gender = 'Male' | 'Female'

export type SmokingHistory =
  | 'never'
  | 'former'
  | 'current'
  | 'ever'
  | 'not current'
  | 'No Info'

export type Timing = 'before_meal' | 'after_meal'

export type ReadingResult = 'normal' | 'abnormal_high' | 'abnormal_low'

export type RiskTier = 'high' | 'watch' | 'low'

export interface Member {
  id: string
  owner_id: string
  name: string
  age: number
  gender: Gender
  height_cm: number
  weight_kg: number
  bmi: number
  hypertension: 0 | 1
  heart_disease: 0 | 1
  smoking_history: SmokingHistory
  hba1c_level: number
  created_at: string
  updated_at: string
}

export type NewMember = Omit<Member, 'id' | 'owner_id' | 'created_at' | 'updated_at'>

export interface Reading {
  id: string
  member_id: string
  owner_id: string
  blood_glucose_level: number
  timing: Timing
  meds_taken: 0 | 1
  result: ReadingResult
  created_at: string
}

export type NewReading = Omit<Reading, 'id' | 'created_at'>

export interface DailyAnalysisRequest {
  blood_glucose_level: number
  timing: Timing
  meds_taken: 0 | 1
  result: 'abnormal_high' | 'abnormal_low'
}

export interface DailyAnalysisResponse {
  explanation: string
}

export interface RiskPredictionRequest {
  age: number
  hypertension: 0 | 1
  heart_disease: 0 | 1
  bmi: number
  HbA1c_level: number
  blood_glucose_level: number
  gender: Gender
  smoking_history: SmokingHistory
}

export interface RiskPredictionResponse {
  diabetes_result: string
  diabetes_probability: number
  risk_tier: RiskTier
  explanation: string
}

export type InsightMessage =
  | { id: string; kind: 'abnormal'; createdAt: string; badgeLabel: string; explanation: string }
  | {
      id: string
      kind: 'prediction'
      createdAt: string
      riskTier: RiskTier
      explanation: string
      diabetesResult: string
      diabetesProbability: number
    }
  | { id: string; kind: 'error'; createdAt: string; message: string }
