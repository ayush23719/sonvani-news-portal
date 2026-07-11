import { getJson } from './apiClient'
import type { ArticleImage, SeoMetadata } from '@/types/news'
import type { VideoItem } from '@/types/homepage'

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

export type VideoListingResponse = {
  items: VideoItem[]
  pagination: ApiPagination
}

export async function fetchVideos(cursor?: string): Promise<VideoListingResponse> {
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
  >(`/videos?${params}`)

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'Unable to load videos')
  }

  return {
    items: response.data.items.map(toVideoItem),
    pagination: response.data.pagination,
  }
}

function toVideoItem(article: ApiArticleSummary): VideoItem {
  const videoId = article.youtubeVideoId ?? ''

  return {
    id: article.articleId,
    title: article.title,
    href: `/articles/${article.slug}`,
    youtubeVideoId: videoId,
    thumbnailUrl: videoId
      ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
      : (article.primaryImage?.url ??
        article.images?.find((i) => i.isPrimary)?.url ??
        article.images?.[0]?.url ??
        ''),
    duration: 'YouTube',
    imageLabel: article.category,
  }
}
