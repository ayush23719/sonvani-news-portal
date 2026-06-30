export type ApiError = {
  code: string
  message: string
  details?: Record<string, unknown>
}

export type Pagination = {
  limit: number
  nextCursor: string | null
  hasMore: boolean
}

export type ApiResponse<TData> = {
  success: boolean
  data?: TData
  error?: ApiError
  pagination?: Pagination
  requestId: string
}
