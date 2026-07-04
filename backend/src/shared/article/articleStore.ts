import { randomUUID } from 'node:crypto'
import {
  DeleteCommand,
  PutCommand,
  ScanCommand,
  type ScanCommandInput,
} from '@aws-sdk/lib-dynamodb'
import { dynamoDbDocumentClient } from '../clients/dynamodb.js'
import { AppError } from '../errors/appError.js'
import type { Article, ArticleImage, ArticleStatus, SeoMetadata } from '../types/news.js'

export type ArticleWriteInput = Partial<Article> & {
  articleId?: string
  createdBy?: string
  status?: ArticleStatus
  publishDate?: string
}

export type ArticleTableRecord = Article & {
  pk: 'ARTICLE'
  sk: string
  createdAt: string
  createdBy?: string
  updatedBy?: string
  breakingPartition?: 'BREAKING'
  featuredPartition?: 'FEATURED'
  seo?: SeoMetadata
}

export function normalizeArticleInput(
  input: ArticleWriteInput,
  defaults: { createdBy?: string; status?: ArticleStatus },
): Article {
  const title = input.title?.trim() ?? ''
  if (!title) {
    throw new AppError('VALIDATION_ERROR', 'Title is required.', 400)
  }

  const summary = input.summary?.trim() ?? ''
  const body = input.body?.trim() ?? ''
  const category = input.category?.trim() || 'General'
  const categorySlug = input.categorySlug?.trim() || slugify(category)
  const district = input.district?.trim()

  const districtSlug =
    input.districtSlug?.trim() ||
    (district ? slugify(district) || encodeURIComponent(district) : undefined)

  const state = input.state?.trim()

  const stateSlug =
    input.stateSlug?.trim() ||
    (state ? slugify(state) || encodeURIComponent(state) : undefined)
  const slug = normalizeSlug(input.slug, title)
  const images = normalizeImages(input.images)
  const now = new Date().toISOString()

  return {
    articleId: input.articleId ?? randomUUID(),
    slug,
    title,
    summary,
    body,
    images,
    youtubeVideoId: extractYoutubeVideoId(input.youtubeVideoId),
    reporterName: input.reporterName?.trim() || defaults.createdBy?.trim() || 'Reporter',
    category,
    categorySlug,
    district,
    districtSlug,
    state,
    stateSlug,
    publishDate: input.publishDate ?? now,
    updatedAt: now,
    isBreaking: Boolean(input.isBreaking),
    isFeatured: Boolean(input.isFeatured),
    status: input.status ?? defaults.status ?? 'DRAFT',
    seo: normalizeSeo(input.seo),
  }
}

export function buildArticleRecord(
  input: ArticleWriteInput,
  defaults: { createdBy?: string; status?: ArticleStatus },
): ArticleTableRecord {
  const article = normalizeArticleInput(input, defaults)
  const now = article.updatedAt ?? new Date().toISOString()
  const status = article.status
  const keyPrefix = status === 'PUBLISHED' ? 'PUBLISHED#' : 'DRAFT#'

  return {
    pk: 'ARTICLE',
    sk: `${keyPrefix}${article.articleId}`,
    ...article,
    createdAt: input.publishDate ?? now,
    createdBy: defaults.createdBy,
    updatedBy: defaults.createdBy,
    breakingPartition: article.isBreaking ? 'BREAKING' : undefined,
    featuredPartition: article.isFeatured ? 'FEATURED' : undefined,
    seo: article.seo,
  }
}

export async function putArticleRecord(
  tableName: string,
  record: ArticleTableRecord,
): Promise<void> {
  await dynamoDbDocumentClient.send(
    new PutCommand({
      TableName: tableName,
      Item: record,
    }),
  )
}

export async function getArticleRecordById(
  tableName: string,
  articleId: string,
): Promise<ArticleTableRecord | null> {
  const commandInput: ScanCommandInput = {
    TableName: tableName,
    FilterExpression: 'articleId = :articleId',
    ExpressionAttributeValues: {
      ':articleId': articleId,
    },
  }

  const result = await dynamoDbDocumentClient.send(new ScanCommand(commandInput))

  const items = (result.Items ?? []) as ArticleTableRecord[]

  if (items.length === 0) {
    return null
  }

  const draft = items.find((item) => item.status === 'DRAFT')
  if (draft) {
    return draft
  }

  const published = items.find((item) => item.status === 'PUBLISHED')
  if (published) {
    return published
  }

  return items[0]
}

export async function deleteArticleRecord(
  tableName: string,
  articleId: string,
): Promise<void> {
  const existingRecord = await getArticleRecordById(tableName, articleId)

  if (!existingRecord) {
    throw new AppError('ARTICLE_NOT_FOUND', 'Article not found.', 404)
  }

  await dynamoDbDocumentClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: {
        pk: existingRecord.pk,
        sk: existingRecord.sk,
      },
    }),
  )
}

export async function deleteArticleRecordByKey(
  tableName: string,
  pk: string,
  sk: string,
): Promise<void> {
  await dynamoDbDocumentClient.send(
    new DeleteCommand({
      TableName: tableName,
      Key: {
        pk,
        sk,
      },
    }),
  )
}

export async function listArticlesForReporter(
  tableName: string,
  createdBy?: string,
): Promise<ArticleTableRecord[]> {
  const commandInput: ScanCommandInput = {
    TableName: tableName,
    FilterExpression: createdBy ? 'createdBy = :createdBy' : undefined,
    ExpressionAttributeValues: createdBy ? { ':createdBy': createdBy } : undefined,
  }

  const result = await dynamoDbDocumentClient.send(new ScanCommand(commandInput))
  return ((result.Items ?? []) as ArticleTableRecord[]).sort((left, right) => {
    const leftValue = left.updatedAt ?? left.publishDate ?? ''
    const rightValue = right.updatedAt ?? right.publishDate ?? ''
    return rightValue.localeCompare(leftValue)
  })
}

function normalizeImages(images?: ArticleImage[]): ArticleImage[] {
  if (!images || images.length === 0) {
    return []
  }

  return images.map((image, index) => ({
    url: image.url?.trim() ?? '',
    altText: image.altText?.trim() ?? '',
    caption: image.caption?.trim() ?? '',
    credit: image.credit?.trim() ?? '',
    sortOrder: image.sortOrder ?? index,
    isPrimary: Boolean(image.isPrimary) || index === 0,
  }))
}

function normalizeSeo(seo?: SeoMetadata): SeoMetadata | undefined {
  if (!seo) {
    return undefined
  }

  return {
    title: seo.title?.trim() || undefined,
    description: seo.description?.trim() || undefined,
    keywords: seo.keywords
      ?.filter(Boolean)
      .map((keyword) => keyword.trim())
      .filter(Boolean),
    canonicalUrl: seo.canonicalUrl?.trim() || undefined,
    ogImage: seo.ogImage?.trim() || undefined,
  }
}

function normalizeSlug(slug: string | undefined, fallbackTitle: string): string {
  const trimmedValue = slug?.trim()

  if (trimmedValue) {
    return trimmedValue
  }

  const generatedSlug = slugify(fallbackTitle)

  if (generatedSlug) {
    return generatedSlug
  }

  return randomUUID()
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function extractYoutubeVideoId(value?: string): string | undefined {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()

  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed
  }

  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/))([\w-]{11})/,
  )

  if (match?.[1]) {
    return match[1]
  }

  return trimmed
}
