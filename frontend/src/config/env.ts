export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  siteDomain: import.meta.env.VITE_SITE_DOMAIN ?? '',
} as const
