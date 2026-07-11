import { getJson } from './apiClient'
import type { ArticleImage, SeoMetadata } from '@/types/news'
import type { NewsItem } from '@/types/homepage'

type ApiPagination = {
  limit: number
  nextCursor: string | null
  hasMore: boolean
}

type ApiArticleSummary = {
  articleId: string
  slug: string
  title: string
  summary: string
  images: ArticleImage[]
  primaryImage?: ArticleImage
  youtubeVideoId?: string
  reporterName?: string
  category: string
  categorySlug: string
  district?: string
  districtSlug?: string
  state?: string
  stateSlug?: string
  publishDate: string
  updatedAt?: string
  isBreaking: boolean
  isFeatured: boolean
  status: string
  seo?: SeoMetadata
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}

export type GalleryListingResponse = {
  items: NewsItem[]
  pagination: ApiPagination
}

export async function fetchGallery(cursor?: string): Promise<GalleryListingResponse> {
  const params = new URLSearchParams({
    limit: '12',
  })

  if (cursor) {
    params.set('cursor', cursor)
  }

  const response = await getJson<
    ApiResponse<{
      items: ApiArticleSummary[]
      pagination: ApiPagination
    }>
  >(`/gallery?${params}`)

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'Unable to load gallery')
  }

  return {
    items: response.data.items.map(toNewsItem),
    pagination: response.data.pagination,
  }
}

function toNewsItem(article: ApiArticleSummary): NewsItem {
  return {
    id: article.articleId,
    title: article.title,
    summary: article.summary,
    href: `/articles/${article.slug}`,
    category: article.category,
    categorySlug: article.categorySlug,
    district: article.district,
    districtSlug: article.districtSlug,
    state: article.state,
    publishedAt: article.publishDate,
    imageLabel: article.category,
    imageTone: 'navy',
    imageUrl:
      article.primaryImage?.url ??
      article.images?.find((i) => i.isPrimary)?.url ??
      article.images?.[0]?.url,
    isBreaking: article.isBreaking,
    isFeatured: article.isFeatured,
  }
}
