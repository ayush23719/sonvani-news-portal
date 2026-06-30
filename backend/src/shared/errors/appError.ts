export type AppErrorCode =
  | 'ARTICLE_NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'DYNAMODB_ERROR'
  | 'NOT_IMPLEMENTED'
  | 'INTERNAL_SERVER_ERROR'

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly statusCode: number
  readonly details?: Record<string, unknown>

  constructor(code: AppErrorCode, message: string, statusCode = 500, details?: Record<string, unknown>) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details
  }
}
