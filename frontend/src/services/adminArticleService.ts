import { env } from '@/config/env'

const apiBaseUrl = env.apiBaseUrl.replace(/\/$/, '')

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const auth = localStorage.getItem('hindi-news-portal-auth')

  let idToken = ''

  if (auth) {
    try {
      idToken = JSON.parse(auth).idToken
    } catch {}
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(idToken
        ? {
            Authorization: `Bearer ${idToken}`,
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

export function getMyArticles(createdBy?: string) {
  const query = createdBy ? `?createdBy=${encodeURIComponent(createdBy)}` : ''

  return request<{
    success: boolean
    data: {
      articles: unknown[]
    }
  }>(`/admin/articles${query}`)
}

export function createArticle(payload: unknown) {
  return request('/admin/articles', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateArticle(articleId: string, payload: unknown) {
  return request(`/admin/articles/${articleId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function publishArticle(articleId: string) {
  return request(`/admin/articles/${articleId}/publish`, {
    method: 'POST',
  })
}

export function deleteArticle(articleId: string) {
  return request(`/admin/articles/${articleId}`, {
    method: 'DELETE',
  })
}
export function getArticle(articleId: string) {
  return request<{
    success: boolean
    data: {
      article: Record<string, unknown>
    }
  }>(`/admin/articles/${articleId}`)
}
