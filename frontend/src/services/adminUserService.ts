import { env } from '@/config/env'

const apiBaseUrl = env.apiBaseUrl.replace(/\/$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const auth = localStorage.getItem('hindi-news-portal-auth')

  let accessToken = ''

  if (auth) {
    try {
      accessToken = JSON.parse(auth).accessToken
    } catch {}
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {}),
      ...(options?.headers ?? {}),
    },
    ...options,
  })
  if (response.status === 401) {
    localStorage.removeItem('hindi-news-portal-auth')
    window.location.href = '/login'
    throw new Error('Unauthorized')
  }
  const json = await response.json()

  if (!response.ok) {
    throw new Error(
      json?.error?.message ?? `Request failed with status ${response.status}`,
    )
  }

  return json as T
}

export function getUsers() {
  return request('/admin/users')
}

export function createReporter(payload: { email: string; name: string }) {
  return request('/admin/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function disableUser(username: string) {
  return request(`/admin/users/${encodeURIComponent(username)}/disable`, {
    method: 'POST',
  })
}

export function enableUser(username: string) {
  return request(`/admin/users/${encodeURIComponent(username)}/enable`, {
    method: 'POST',
  })
}

export function deleteUser(username: string) {
  return request(`/admin/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
  })
}

export function setTemporaryPassword(username: string, password: string) {
  return request(`/admin/users/${encodeURIComponent(username)}/temporary-password`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  })
}
