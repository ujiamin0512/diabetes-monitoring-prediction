import type {
  DailyAnalysisRequest,
  DailyAnalysisResponse,
  RiskPredictionRequest,
  RiskPredictionResponse,
} from './types'

const DAILY_URL = import.meta.env.VITE_N8N_DAILY_URL
const PREDICT_URL = import.meta.env.VITE_N8N_PREDICT_URL

async function postJson<TRaw>(url: string, body: unknown, timeoutMs: number): Promise<TRaw> {
  if (!url) throw new Error('Missing webhook URL')

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    if (!res.ok) throw new Error(`Request failed with status ${res.status}`)
    return (await res.json()) as TRaw
  } finally {
    clearTimeout(timer)
  }
}

export function postDailyAnalysis(payload: DailyAnalysisRequest): Promise<DailyAnalysisResponse> {
  return postJson<DailyAnalysisResponse>(DAILY_URL, payload, 20000)
}

export function postRiskPrediction(
  payload: RiskPredictionRequest,
  onRetry?: (attempt: number) => void,
): Promise<RiskPredictionResponse> {
  // The Render-hosted model cold-starts on its first request (~50s) and can still be
  // spinning up when our 60s timeout fires; the instance keeps booting server-side
  // regardless, so a retry right after almost always lands on an already-warm instance.
  const ATTEMPTS = 3
  const TIMEOUT_MS = 60000

  async function attempt(remaining: number): Promise<RiskPredictionResponse> {
    try {
      return await postJson<RiskPredictionResponse>(PREDICT_URL, payload, TIMEOUT_MS)
    } catch (err) {
      if (remaining <= 1) throw err
      onRetry?.(ATTEMPTS - remaining + 2)
      return attempt(remaining - 1)
    }
  }

  return attempt(ATTEMPTS)
}

export function describeDiabetesResult(diabetesResult: string): string {
  return diabetesResult
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
