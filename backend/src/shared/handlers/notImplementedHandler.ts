import type { APIGatewayProxyEvent, APIGatewayProxyHandler } from 'aws-lambda'
import { logger } from '../logging/logger.js'
import { notImplementedResponse } from '../responses/apiResponse.js'
import { validateRequiredEnvironment } from '../validation/environment.js'

function getRequestId(event: APIGatewayProxyEvent): string {
  return event.requestContext.requestId
}

export function createNotImplementedHandler(functionName: string): APIGatewayProxyHandler {
  return async (event) => {
    validateRequiredEnvironment()

    const requestId = getRequestId(event)

    logger.info('Public API placeholder invoked', {
      functionName,
      requestId,
      httpMethod: event.httpMethod,
      path: event.path,
    })

    return notImplementedResponse(functionName, requestId)
  }
}
