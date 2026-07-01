import type { APIGatewayProxyHandler } from 'aws-lambda'
import { QueryCommand, type QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { dynamoDbDocumentClient } from '../../shared/clients/dynamodb.js'
import { AppError } from '../../shared/errors/appError.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { logger } from '../../shared/logging/logger.js'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'
import { validateRequiredEnvironment } from '../../shared/validation/environment.js'
import type { Article } from '../../shared/types/news.js'

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    validateRequiredEnvironment()

    const slug = event.pathParameters?.slug?.trim()

    if (!slug) {
      logger.warn('Get article by slug: missing slug parameter', {
        requestId,
      })
      throw new AppError('VALIDATION_ERROR', 'Article slug is required.', 400)
    }

    logger.info('Get article by slug: request received', {
      requestId,
      slug,
    })

    const tableName = getRequiredEnv('ARTICLES_TABLE_NAME')

    const commandInput: QueryCommandInput = {
      TableName: tableName,
      IndexName: 'GSI_BySlug',
      KeyConditionExpression: 'slug = :slug AND #status = :status',
      ExpressionAttributeValues: {
        ':slug': slug,
        ':status': 'PUBLISHED',
      },
      ExpressionAttributeNames: {
        '#status': 'status',
      },
    }

    const result = await dynamoDbDocumentClient.send(new QueryCommand(commandInput))
    const article = (result.Items?.[0] as Article | undefined) ?? null

    if (!article) {
      logger.info('Get article by slug: article not found', {
        requestId,
        slug,
      })
      throw new AppError('ARTICLE_NOT_FOUND', 'Article not found.', 404)
    }

    logger.info('Get article by slug: article found', {
      requestId,
      slug,
      articleId: article.articleId,
    })

    return successResponse(article, requestId)
  } catch (error) {
    logger.error('Get article by slug: request failed', {
      requestId,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return errorResponse(error, requestId)
  }
}
