import { AppError } from '../errors/appError.js'

type CursorKey = Record<string, unknown>

export function encodeCursor(key: CursorKey | undefined): string | null {
  if (!key || Object.keys(key).length === 0) {
    return null
  }

  return Buffer.from(JSON.stringify(key), 'utf8').toString('base64url')
}

export function decodeCursor(cursor: string | undefined): CursorKey | undefined {
  if (!cursor) {
    return undefined
  }

  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8')
    const parsed = JSON.parse(decoded) as unknown

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Cursor payload must be an object.')
    }

    return parsed as CursorKey
  } catch {
    throw new AppError('VALIDATION_ERROR', 'Invalid pagination cursor.', 400)
  }
}

export function parsePositiveInteger(value: string | undefined, fallback: number, maximum: number): number {
  if (!value) {
    return fallback
  }

  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > maximum) {
    throw new AppError('VALIDATION_ERROR', `Limit must be between 1 and ${maximum}.`, 400)
  }

  return parsed
}
