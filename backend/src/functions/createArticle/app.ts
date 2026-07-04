import type { APIGatewayProxyHandler } from 'aws-lambda'
import { AppError } from '../../shared/errors/appError.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { logger } from '../../shared/logging/logger.js'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'
import { validateRequiredEnvironment } from '../../shared/validation/environment.js'
import {
  buildArticleRecord,
  putArticleRecord,
} from '../../shared/article/articleStore.js'

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    validateRequiredEnvironment()

    const tableName = getRequiredEnv('ARTICLES_TABLE_NAME')
    const body = parseBody(event.body)
    const claims = (event.requestContext.authorizer?.claims ?? {}) as Record<
      string,
      string
    >

    const createdBy =
      claims.email ?? claims['cognito:username'] ?? claims.sub ?? 'unknown'
    const articleRecord = buildArticleRecord(
      {
        ...body,
        status: 'DRAFT',
      },
      { createdBy, status: 'DRAFT' },
    )
    console.log('ARTICLE RECORD:', JSON.stringify(articleRecord, null, 2))
    await putArticleRecord(tableName, articleRecord)

    logger.info('Article created', {
      requestId,
      articleId: articleRecord.articleId,
      status: articleRecord.status,
    })

    return successResponse({ article: articleRecord }, requestId, 201)
  } catch (error) {
    logger.error('Create article request failed', {
      requestId,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return errorResponse(error, requestId)
  }
}

function parseBody(body: string | null | undefined): Record<string, unknown> {
  if (!body) {
    return {}
  }

  try {
    return JSON.parse(body) as Record<string, unknown>
  } catch {
    throw new AppError('VALIDATION_ERROR', 'Request body must be valid JSON.', 400)
  }
}
