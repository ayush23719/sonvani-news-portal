import { env } from '@/config/env'

export const apiClientConfig = {
  baseUrl: env.apiBaseUrl.replace(/\/$/, ''),
  timeoutMs: 10_000,
} as const

export async function getJson<TResponse>(path: string, signal?: AbortSignal): Promise<TResponse> {
  if (!apiClientConfig.baseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured.')
  }

  const response = await fetch(`${apiClientConfig.baseUrl}${path}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    signal,
  })

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}.`)
  }

  return (await response.json()) as TResponse
}
