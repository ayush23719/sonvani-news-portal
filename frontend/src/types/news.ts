export type ArticleImage = {
  url: string
  altText: string
  caption?: string
  credit?: string
  sortOrder: number
  isPrimary: boolean
}

export type SeoMetadata = {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
}

export type Article = {
  articleId: string
  slug: string
  title: string
  summary: string
  body: string
  images: ArticleImage[]
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
  seo?: SeoMetadata
}
