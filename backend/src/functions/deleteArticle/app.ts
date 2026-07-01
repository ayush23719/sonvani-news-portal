import type { APIGatewayProxyHandler } from 'aws-lambda'
import { AppError } from '../../shared/errors/appError.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { logger } from '../../shared/logging/logger.js'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'
import { validateRequiredEnvironment } from '../../shared/validation/environment.js'
import { deleteArticleRecord } from '../../shared/article/articleStore.js'

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    validateRequiredEnvironment()

    const articleId = event.pathParameters?.articleId?.trim()
    if (!articleId) {
      throw new AppError('VALIDATION_ERROR', 'Article id is required.', 400)
    }

    const tableName = getRequiredEnv('ARTICLES_TABLE_NAME')
    await deleteArticleRecord(tableName, articleId)

    logger.info('Article deleted', {
      requestId,
      articleId,
    })

    return successResponse({ deleted: true, articleId }, requestId)
  } catch (error) {
    logger.error('Delete article request failed', {
      requestId,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return errorResponse(error, requestId)
  }
}
