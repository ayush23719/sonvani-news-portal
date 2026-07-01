import { env } from '@/config/env'

const BASE_URL = env.apiBaseUrl.replace(/\/$/, '')

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!BASE_URL) {
    throw new Error('VITE_API_BASE_URL is not configured.')
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.error?.message ?? `Request failed (${response.status})`)
  }

  return body as T
}

export function getJson<T>(path: string) {
  return request<T>(path)
}

export function postJson<T>(path: string, data: unknown) {
  return request<T>(path, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function putJson<T>(path: string, data: unknown) {
  return request<T>(path, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteJson<T>(path: string) {
  return request<T>(path, {
    method: 'DELETE',
  })
}
