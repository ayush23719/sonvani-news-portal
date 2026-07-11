import type { APIGatewayProxyHandler } from 'aws-lambda'
import { QueryCommand, type QueryCommandInput } from '@aws-sdk/lib-dynamodb'
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

    const stateSlug = decodeURIComponent(event.pathParameters?.stateSlug?.trim() ?? '')

    if (!stateSlug) {
      throw new AppError('VALIDATION_ERROR', 'State slug is required.', 400)
    }

    logger.info('State articles request received', {
      requestId,
      stateSlug,
    })

    const limit = parsePositiveInteger(event.queryStringParameters?.limit, 12, 20)
    const cursor = event.queryStringParameters?.cursor
    const tableName = getRequiredEnv('ARTICLES_TABLE_NAME')

    const commandInput: QueryCommandInput = {
      TableName: tableName,
      IndexName: 'GSI_ByState',
      Limit: limit,
      ScanIndexForward: false,
      KeyConditionExpression: 'stateSlug = :stateSlug AND publishDate <= :now',
      FilterExpression: '#status = :publishedStatus',
      ExpressionAttributeValues: {
        ':stateSlug': stateSlug,
        ':now': new Date().toISOString(),
        ':publishedStatus': 'PUBLISHED',
      },
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExclusiveStartKey: decodeCursor(cursor),
    }

    const result = await dynamoDbDocumentClient.send(new QueryCommand(commandInput))
    const items = (result.Items ?? []).map((item) => item as ArticleSummary)

    logger.info('State articles found', {
      requestId,
      stateSlug,
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
    logger.error('State articles request failed', {
      requestId,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return errorResponse(error, requestId)
  }
}
