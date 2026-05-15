import { getJwtToken } from './auth'
import type { AuthConfig, Spending, SpendingInput, SpendingSummary } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8013'
const API_V1_URL = `${API_BASE_URL}/api/v1`

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getJwtToken()
  const response = await fetch(`${API_V1_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = body?.detail
    if (typeof detail === 'string') {
      throw new Error(detail)
    }

    if (Array.isArray(detail) && detail.length > 0) {
      throw new Error(detail[0]?.msg ?? 'Request failed')
    }

    throw new Error(`Request failed (${response.status})`)
  }

  return body as T
}

export async function fetchAuthConfig(): Promise<AuthConfig> {
  const response = await fetch(`${API_BASE_URL}/auth/config`)
  if (!response.ok) {
    throw new Error(`Auth config failed (${response.status})`)
  }

  return (await response.json()) as AuthConfig
}

export async function fetchSpendings(): Promise<Spending[]> {
  return request<Spending[]>('/spendings')
}

export async function fetchSummary(): Promise<SpendingSummary> {
  return request<SpendingSummary>('/spendings/summary')
}

export async function createSpending(input: SpendingInput): Promise<Spending> {
  return request<Spending>('/spendings', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function deleteSpending(id: number): Promise<void> {
  await request<{ message: string }>(`/spendings/${id}`, {
    method: 'DELETE',
  })
}
