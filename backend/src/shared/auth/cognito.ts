import type { APIGatewayProxyEvent } from 'aws-lambda'
import { AppError } from '../errors/appError.js'
import { getOptionalEnv } from '../env/environment.js'

export type CognitoAuthUser = {
  username: string
  sub?: string
  email?: string
  role: string
  groups: string[]
  token: string
  claims: Record<string, unknown>
}

export function extractBearerToken(event: APIGatewayProxyEvent): string | undefined {
  const authorizationHeader = event.headers?.Authorization ?? event.headers?.authorization

  if (!authorizationHeader) {
    return undefined
  }

  const [scheme, token] = authorizationHeader.split(' ')

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return undefined
  }

  return token
}

export function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1]

  if (!payload) {
    return {}
  }

  const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
  const paddedPayload = normalizedPayload.padEnd(
    normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
    '=',
  )

  return JSON.parse(Buffer.from(paddedPayload, 'base64').toString('utf8')) as Record<
    string,
    unknown
  >
}

export function authenticateRequest(event: APIGatewayProxyEvent): CognitoAuthUser {
  const token = extractBearerToken(event)

  if (!token) {
    throw new AppError('VALIDATION_ERROR', 'Missing Bearer token.', 401)
  }

  const claims = decodeJwtPayload(token)
  const issuer =
    getOptionalEnv('COGNITO_ISSUER') ?? getOptionalEnv('COGNITO_USER_POOL_ISSUER')

  if (issuer && typeof claims.iss === 'string' && claims.iss !== issuer) {
    throw new AppError('VALIDATION_ERROR', 'Unexpected Cognito issuer.', 401)
  }

  const exp = claims.exp
  if (typeof exp === 'number' && exp * 1000 <= Date.now()) {
    throw new AppError('VALIDATION_ERROR', 'Cognito token has expired.', 401)
  }

  const rawGroups = claims['cognito:groups']
  const groups = Array.isArray(rawGroups)
    ? rawGroups.filter((group): group is string => typeof group === 'string')
    : []

  const sub = typeof claims.sub === 'string' ? claims.sub : undefined
  const email = typeof claims.email === 'string' ? claims.email : undefined
  const username =
    typeof claims.username === 'string'
      ? claims.username
      : (email ?? sub ?? 'unknown-user')
  const role = normalizeRole(claims['custom:role'] ?? groups[0] ?? 'PUBLIC')

  return {
    username,
    sub,
    email,
    role,
    groups,
    token,
    claims,
  }
}

export function authorizeRoles(
  user: CognitoAuthUser,
  allowedRoles: string[],
): CognitoAuthUser {
  if (allowedRoles.length === 0) {
    return user
  }

  const normalizedRoles = allowedRoles.map((role) => role.toUpperCase())

  if (!normalizedRoles.includes(user.role.toUpperCase())) {
    throw new AppError(
      'VALIDATION_ERROR',
      'You do not have permission to perform this action.',
      403,
    )
  }

  return user
}

export function requireRole(
  event: APIGatewayProxyEvent,
  allowedRoles: string[],
): CognitoAuthUser {
  const user = authenticateRequest(event)
  return authorizeRoles(user, allowedRoles)
}

function normalizeRole(value: unknown): string {
  if (typeof value === 'string') {
    const normalizedValue = value.toUpperCase()

    if (
      normalizedValue === 'ADMIN' ||
      normalizedValue === 'REPORTER' ||
      normalizedValue === 'PUBLIC'
    ) {
      return normalizedValue
    }
  }

  return 'PUBLIC'
}
