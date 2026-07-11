import type { APIGatewayProxyHandler } from 'aws-lambda'
import { dynamoDbDocumentClient } from '../../shared/clients/dynamodb.js'
import { AppError } from '../../shared/errors/appError.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { logger } from '../../shared/logging/logger.js'
import {
  decodeCursor,
  encodeCursor,
  parsePositiveInteger,
} from '../../shared/pagination/cursor.js'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'
import { validateRequiredEnvironment } from '../../shared/validation/environment.js'
import type { Article } from '../../shared/types/news.js'
import { ScanCommand, type ScanCommandInput } from '@aws-sdk/lib-dynamodb'
type ArticleSummary = Omit<Article, 'body'>

type ListingResponse = {
  items: ArticleSummary[]
  pagination: {
    limit: number
    nextCursor: string | null
    hasMore: boolean
  }
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    validateRequiredEnvironment()

    const limit = parsePositiveInteger(event.queryStringParameters?.limit, 12, 20)
    const cursor = event.queryStringParameters?.cursor
    const tableName = getRequiredEnv('ARTICLES_TABLE_NAME')
    const commandInput: ScanCommandInput = {
      TableName: tableName,
      Limit: limit,
      ExclusiveStartKey: decodeCursor(cursor),
      FilterExpression: '#status = :publishedStatus AND attribute_exists(youtubeVideoId)',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':publishedStatus': 'PUBLISHED',
      },
    }

    const result = await dynamoDbDocumentClient.send(new ScanCommand(commandInput))
    const items = (result.Items ?? []).map((item) => item as ArticleSummary)

    logger.info('Video articles found', {
      requestId,
      count: items.length,
    })

    const response: ListingResponse = {
      items,
      pagination: {
        limit,
        nextCursor: encodeCursor(result.LastEvaluatedKey),
        hasMore: Boolean(result.LastEvaluatedKey),
      },
    }

    return successResponse(response, requestId)
  } catch (error) {
    logger.error('Category articles request failed', {
      requestId,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return errorResponse(error, requestId)
  }
}
