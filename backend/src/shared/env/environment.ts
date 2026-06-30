import { DEFAULT_AWS_REGION } from '../constants/environment.js'

export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]
  return value && value.trim().length > 0 ? value : undefined
}

export function getRequiredEnv(name: string): string {
  const value = getOptionalEnv(name)

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export function getAwsRegion(): string {
  return getOptionalEnv('AWS_REGION') ?? DEFAULT_AWS_REGION
}
