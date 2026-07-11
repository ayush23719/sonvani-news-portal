import { getJson } from './apiClient'
import type { NewsItem } from '@/types/homepage'
import type { ArticleImage, SeoMetadata } from '@/types/news'

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

type ApiResponse = {
  success: boolean
  data: {
    items: ApiArticleSummary[]
  }
}

export async function searchArticles(query: string): Promise<NewsItem[]> {
  const response = await getJson<ApiResponse>(`/search?q=${encodeURIComponent(query)}`)

  return response.data.items.map((article) => ({
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
  }))
}
