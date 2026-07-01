import type { APIGatewayProxyHandler } from 'aws-lambda'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { logger } from '../../shared/logging/logger.js'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'
import { validateRequiredEnvironment } from '../../shared/validation/environment.js'
import { listArticlesForReporter } from '../../shared/article/articleStore.js'

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    validateRequiredEnvironment()

    const tableName = getRequiredEnv('ARTICLES_TABLE_NAME')
    const createdBy = event.queryStringParameters?.createdBy?.trim()

    const articles = await listArticlesForReporter(tableName, createdBy)

    logger.info('My articles listed', {
      requestId,
      createdBy,
      count: articles.length,
    })

    return successResponse({ articles }, requestId)
  } catch (error) {
    logger.error('Get my articles request failed', {
      requestId,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return errorResponse(error, requestId)
  }
}
