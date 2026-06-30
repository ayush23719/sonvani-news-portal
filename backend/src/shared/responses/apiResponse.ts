import type { APIGatewayProxyResult } from 'aws-lambda'
import { AppError } from '../errors/appError.js'
import type { ApiError, ApiResponse } from '../types/api.js'

const defaultHeaders = {
  'Content-Type': 'application/json; charset=utf-8',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Requested-With',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
}

export function jsonResponse<TData>(statusCode: number, body: ApiResponse<TData>): APIGatewayProxyResult {
  return {
    statusCode,
    headers: defaultHeaders,
    body: JSON.stringify(body),
  }
}

export function successResponse<TData>(data: TData, requestId: string, statusCode = 200): APIGatewayProxyResult {
  return jsonResponse(statusCode, {
    success: true,
    data,
    requestId,
  })
}

export function errorResponse(error: unknown, requestId: string): APIGatewayProxyResult {
  if (error instanceof AppError) {
    return jsonResponse(error.statusCode, {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      requestId,
    })
  }

  const apiError: ApiError = {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Unexpected server error.',
  }

  return jsonResponse(500, {
    success: false,
    error: apiError,
    requestId,
  })
}

export function notImplementedResponse(functionName: string, requestId: string): APIGatewayProxyResult {
  return errorResponse(
    new AppError('NOT_IMPLEMENTED', `${functionName} is not implemented in this milestone.`, 501),
    requestId,
  )
}
