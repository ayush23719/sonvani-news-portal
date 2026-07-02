import type { APIGatewayProxyHandler } from 'aws-lambda'
import { AppError } from '../../shared/errors/appError.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { logger } from '../../shared/logging/logger.js'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'
import { validateRequiredEnvironment } from '../../shared/validation/environment.js'
import {
  getArticleRecordById,
  putArticleRecord,
  extractYoutubeVideoId,
} from '../../shared/article/articleStore.js'

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    validateRequiredEnvironment()

    const articleId = event.pathParameters?.articleId?.trim()

    if (!articleId) {
      throw new AppError('VALIDATION_ERROR', 'Article id is required.', 400)
    }

    const tableName = getRequiredEnv('ARTICLES_TABLE_NAME')

    const article = await getArticleRecordById(tableName, articleId)

    if (!article) {
      throw new AppError('ARTICLE_NOT_FOUND', 'Article not found.', 404)
    }

    const body = parseBody(event.body)

    article.title = typeof body.title === 'string' ? body.title : article.title
    article.summary = typeof body.summary === 'string' ? body.summary : article.summary
    article.body = typeof body.body === 'string' ? body.body : article.body

    article.slug = typeof body.slug === 'string' ? body.slug : article.slug

    article.category =
      typeof body.category === 'string' ? body.category : article.category

    article.categorySlug =
      typeof body.categorySlug === 'string' ? body.categorySlug : article.categorySlug

    article.district =
      typeof body.district === 'string' ? body.district : article.district

    article.districtSlug =
      typeof body.districtSlug === 'string' ? body.districtSlug : article.districtSlug

    article.state = typeof body.state === 'string' ? body.state : article.state

    article.stateSlug =
      typeof body.stateSlug === 'string' ? body.stateSlug : article.stateSlug

    article.reporterName =
      typeof body.reporterName === 'string' ? body.reporterName : article.reporterName

    article.youtubeVideoId =
      typeof body.youtubeVideoId === 'string'
        ? extractYoutubeVideoId(body.youtubeVideoId)
        : article.youtubeVideoId

    if (Array.isArray(body.images)) {
      article.images = body.images as typeof article.images
    }

    article.updatedAt = new Date().toISOString()

    await putArticleRecord(tableName, article)

    logger.info('Article updated', {
      requestId,
      articleId,
    })

    return successResponse({ article }, requestId)
  } catch (error) {
    logger.error('Update article request failed', {
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
