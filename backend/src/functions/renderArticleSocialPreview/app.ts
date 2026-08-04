import type { APIGatewayProxyHandler } from 'aws-lambda'
import { QueryCommand, type QueryCommandInput } from '@aws-sdk/lib-dynamodb'
import { dynamoDbDocumentClient } from '../../shared/clients/dynamodb.js'
import { getOptionalEnv, getRequiredEnv } from '../../shared/env/environment.js'
import { logger } from '../../shared/logging/logger.js'
import { validateRequiredEnvironment } from '../../shared/validation/environment.js'
import type { Article } from '../../shared/types/news.js'

const DEFAULT_SITE_DOMAIN = 'https://sonvani.in'
const DEFAULT_SITE_NAME = 'Son Vani'

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    validateRequiredEnvironment()

    const slug = decodeURIComponent(event.pathParameters?.slug?.trim() ?? '')

    if (!slug) {
      return htmlResponse(400, '<h1>Article slug is required.</h1>', requestId)
    }

    const tableName = getRequiredEnv('ARTICLES_TABLE_NAME')
    const siteDomain = normalizeSiteDomain(
      getOptionalEnv('SITE_DOMAIN') ??
        getOptionalEnv('FRONTEND_URL') ??
        DEFAULT_SITE_DOMAIN,
    )
    const siteName = getOptionalEnv('SITE_NAME') ?? DEFAULT_SITE_NAME

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
      logger.warn('Social preview requested for missing article', {
        requestId,
        slug,
      })
      return htmlResponse(404, '<h1>Article not found.</h1>', requestId)
    }

    const title = article.seo?.title?.trim() || article.title
    const description =
      article.seo?.description?.trim() || article.summary || 'Son Vani News'
    const articleUrl = `${siteDomain}/articles/${encodeURIComponent(slug)}`
    const imageUrl = resolveImageUrl(article, siteDomain)

    const html = `<!doctype html>
<html lang="hi">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} | ${escapeHtml(siteName)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${escapeHtml(imageUrl)}" />
    <meta property="og:url" content="${escapeHtml(articleUrl)}" />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${escapeHtml(siteName)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}" />
    <link rel="canonical" href="${escapeHtml(articleUrl)}" />
  </head>
  <body>
    <main>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(description)}</p>
    </main>
  </body>
</html>`

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
      body: html,
    }
  } catch (error) {
    logger.error('Social preview generation failed', {
      requestId,
      errorName: error instanceof Error ? error.name : 'UnknownError',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    })

    return htmlResponse(500, '<h1>Unable to render preview.</h1>', requestId)
  }
}

function htmlResponse(statusCode: number, body: string, requestId: string) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'x-request-id': requestId,
    },
    body,
  }
}

function normalizeSiteDomain(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return DEFAULT_SITE_DOMAIN
  }

  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function resolveImageUrl(article: Article, siteDomain: string): string {
  const primaryImage = article.images?.find((image) => image.isPrimary)
  const candidate = primaryImage?.url?.trim() || article.seo?.ogImage?.trim()

  if (!candidate) {
    return `${siteDomain}/brand/sonvani-logo.svg`
  }

  if (/^https?:\/\//i.test(candidate) || candidate.startsWith('data:')) {
    return candidate
  }

  return new URL(candidate, siteDomain).toString()
}
