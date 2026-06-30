import { env } from '@/config/env'

export const apiClientConfig = {
  baseUrl: env.apiBaseUrl,
  timeoutMs: 10_000,
} as const
