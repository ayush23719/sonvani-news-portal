import type { Pagination } from '../../shared/types/api.js'
import type { Article, ArticleImage, SeoMetadata } from '../../shared/types/news.js'

export type ArticleSummary = Omit<Article, 'body'> & {
  primaryImage?: ArticleImage
}

export type HomeFeedSection = {
  items: ArticleSummary[]
  pagination: Pagination
}

export type HomeFeedResponse = {
  latestArticles: HomeFeedSection
  featuredArticles: HomeFeedSection
  breakingNews: HomeFeedSection
}

export type ArticleRecord = Article & {
  pk: string
  sk: string
  createdAt?: string
  createdBy?: string
  updatedBy?: string
  breakingPartition?: 'BREAKING'
  featuredPartition?: 'FEATURED'
  seo?: SeoMetadata
}
