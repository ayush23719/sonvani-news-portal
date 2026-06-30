import type { APIGatewayProxyHandler } from 'aws-lambda'
import { QueryCommand, type QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { dynamoDbDocumentClient } from '../../shared/clients/dynamodb.js'
import { AppError } from '../../shared/errors/appError.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { logger } from '../../shared/logging/logger.js'
import { decodeCursor, encodeCursor, parsePositiveInteger } from '../../shared/pagination/cursor.js'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'
import { validateRequiredEnvironment } from '../../shared/validation/environment.js'
import type { Pagination } from '../../shared/types/api.js'
import type { ArticleImage } from '../../shared/types/news.js'
import type { ArticleRecord, ArticleSummary, HomeFeedResponse, HomeFeedSection } from './types.js'

const MAX_LIMIT = 20
const DEFAULT_LATEST_LIMIT = 10
const DEFAULT_FEATURED_LIMIT = 5
const DEFAULT_BREAKING_LIMIT = 5

type SectionQueryConfig = {
  tableName: string
  limit: number
  cursor?: string
  indexName?: string
  keyConditionExpression: string
  expressionAttributeValues: Record<string, unknown>
  expressionAttributeNames?: Record<string, string>
}

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    validateRequiredEnvironment()

    const tableName = getRequiredEnv('ARTICLES_TABLE_NAME')
    const query = event.queryStringParameters ?? {}

    const [latestArticles, featuredArticles, breakingNews] = await Promise.all([
      queryHomeFeedSection({
        tableName,
        limit: parsePositiveInteger(query.latestLimit, DEFAULT_LATEST_LIMIT, MAX_LIMIT),
        cursor: query.latestCursor,
        keyConditionExpression: 'pk = :pk AND begins_with(sk, :publishedPrefix)',
        expressionAttributeValues: {
          ':pk': 'ARTICLE',
          ':publishedPrefix': 'PUBLISHED#',
          ':publishedStatus': 'PUBLISHED',
        },
        expressionAttributeNames: {
          '#status': 'status',
        },
      }),
      queryHomeFeedSection({
        tableName,
        indexName: 'GSI_FeaturedArticles',
        limit: parsePositiveInteger(query.featuredLimit, DEFAULT_FEATURED_LIMIT, MAX_LIMIT),
        cursor: query.featuredCursor,
        keyConditionExpression: 'featuredPartition = :featuredPartition',
        expressionAttributeValues: {
          ':featuredPartition': 'FEATURED',
          ':publishedStatus': 'PUBLISHED',
        },
        expressionAttributeNames: {
          '#status': 'status',
        },
      }),
      queryHomeFeedSection({
        tableName,
        indexName: 'GSI_BreakingNews',
        limit: parsePositiveInteger(query.breakingLimit, DEFAULT_BREAKING_LIMIT, MAX_LIMIT),
        cursor: query.breakingCursor,
        keyConditionExpression: 'breakingPartition = :breakingPartition',
        expressionAttributeValues: {
          ':breakingPartition': 'BREAKING',
          ':publishedStatus': 'PUBLISHED',
        },
        expressionAttributeNames: {
          '#status': 'status',
        },
      }),
    ])

    const response: HomeFeedResponse = {
      latestArticles,
      featuredArticles,
      breakingNews,
    }

    logger.info('Home feed returned successfully', {
      requestId,
      latestCount: latestArticles.items.length,
      featuredCount: featuredArticles.items.length,
      breakingCount: breakingNews.items.length,
    })

    return successResponse(response, requestId)
  } catch (error) {
    logger.error('Home feed request failed', {
      requestId,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return errorResponse(error, requestId)
  }
}

async function queryHomeFeedSection(config: SectionQueryConfig): Promise<HomeFeedSection> {
  const commandInput: QueryCommandInput = {
    TableName: config.tableName,
    IndexName: config.indexName,
    Limit: config.limit,
    ScanIndexForward: false,
    KeyConditionExpression: config.keyConditionExpression,
    FilterExpression: '#status = :publishedStatus',
    ExpressionAttributeValues: config.expressionAttributeValues,
    ExpressionAttributeNames: config.expressionAttributeNames,
    ExclusiveStartKey: decodeCursor(config.cursor),
  }

  try {
    const result = await dynamoDbDocumentClient.send(new QueryCommand(commandInput))
    const items = (result.Items ?? []).map((item) => toArticleSummary(item as ArticleRecord))

    const pagination: Pagination = {
      limit: config.limit,
      nextCursor: encodeCursor(result.LastEvaluatedKey),
      hasMore: Boolean(result.LastEvaluatedKey),
    }

    return {
      items,
      pagination,
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    throw new AppError('DYNAMODB_ERROR', 'Failed to load home feed articles.', 502, {
      indexName: config.indexName ?? 'PRIMARY',
    })
  }
}

function toArticleSummary(record: ArticleRecord): ArticleSummary {
  const primaryImage = getPrimaryImage(record.images)

  return {
    articleId: record.articleId,
    slug: record.slug,
    title: record.title,
    summary: record.summary,
    images: record.images,
    primaryImage,
    youtubeVideoId: record.youtubeVideoId,
    reporterName: record.reporterName,
    category: record.category,
    categorySlug: record.categorySlug,
    district: record.district,
    districtSlug: record.districtSlug,
    state: record.state,
    stateSlug: record.stateSlug,
    publishDate: record.publishDate,
    updatedAt: record.updatedAt,
    isBreaking: record.isBreaking,
    isFeatured: record.isFeatured,
    status: record.status,
    seo: record.seo,
  }
}

function getPrimaryImage(images: ArticleImage[]): ArticleImage | undefined {
  return images.find((image) => image.isPrimary) ?? images[0]
}
