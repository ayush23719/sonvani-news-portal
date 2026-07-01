export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  siteDomain: import.meta.env.VITE_SITE_DOMAIN ?? '',

  cognitoUserPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID ?? '',
  cognitoClientId: import.meta.env.VITE_COGNITO_CLIENT_ID ?? '',

  cognitoDomain: import.meta.env.VITE_COGNITO_DOMAIN ?? '',
  cognitoRedirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI ?? '',
  cognitoLogoutUri: import.meta.env.VITE_COGNITO_LOGOUT_URI ?? '',
} as const
