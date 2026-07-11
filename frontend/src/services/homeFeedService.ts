import { getJson } from './apiClient'
import type { ArticleImage, SeoMetadata } from '@/types/news'
import type {
  CategoryBlock,
  DistrictBlock,
  GalleryItem,
  NewsItem,
  VideoItem,
} from '@/types/homepage'

type ApiPagination = {
  limit: number
  nextCursor: string | null
  hasMore: boolean
}

type HomeFeedSection = {
  items: ApiArticleSummary[]
  pagination: ApiPagination
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

type HomeFeedApiData = {
  latestArticles: HomeFeedSection
  featuredArticles: HomeFeedSection
  breakingNews: HomeFeedSection
}

type ApiResponse<TData> = {
  success: boolean
  data?: TData
  error?: {
    code: string
    message: string
  }
  requestId: string
}

export type HomePageData = {
  breakingNews: NewsItem[]
  heroStory: NewsItem
  topStories: NewsItem[]
  latestNews: NewsItem[]
  categorySections: CategoryBlock[]
  districtSections: DistrictBlock[]
  videoNews: VideoItem[]
  photoGallery: GalleryItem[]
}

const imageTones: NewsItem['imageTone'][] = ['navy', 'red', 'green', 'amber', 'slate']

export async function fetchHomePageData(): Promise<HomePageData> {
  const response = await getJson<ApiResponse<HomeFeedApiData>>('/home')

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'होम फीड लोड नहीं हो सकी।')
  }

  return toHomePageData(response.data)
}

function toHomePageData(data: HomeFeedApiData): HomePageData {
  const latestNews = data.latestArticles.items.map(toNewsItem)
  const featuredNews = data.featuredArticles.items.map(toNewsItem)
  const breakingNews = data.breakingNews.items.map(toNewsItem)
  const allArticles = uniqueArticles([...featuredNews, ...breakingNews, ...latestNews])
  const heroStory = featuredNews[0] ?? latestNews[0] ?? breakingNews[0]

  if (!heroStory) {
    throw new Error('अभी कोई खबर उपलब्ध नहीं है।')
  }
  function uniqueApiArticles(items: ApiArticleSummary[]) {
    const seen = new Set<string>()

    return items.filter((item) => {
      if (seen.has(item.articleId)) {
        return false
      }

      seen.add(item.articleId)
      return true
    })
  }

  return {
    breakingNews: breakingNews.length > 0 ? breakingNews : latestNews.slice(0, 3),
    heroStory,
    topStories: uniqueArticles([...featuredNews.slice(1), ...latestNews]).slice(0, 4),
    latestNews,
    categorySections: buildCategorySections(allArticles),
    districtSections: buildDistrictSections(allArticles),
    videoNews: buildVideoNews(
      uniqueApiArticles([
        ...data.latestArticles.items,
        ...data.featuredArticles.items,
        ...data.breakingNews.items,
      ]),
    ),
    photoGallery: buildPhotoGallery(
      uniqueApiArticles([
        ...data.latestArticles.items,
        ...data.featuredArticles.items,
        ...data.breakingNews.items,
      ]),
    ),
  }
}

function toNewsItem(article: ApiArticleSummary, index = 0): NewsItem {
  return {
    id: article.articleId,
    title: article.title,
    summary: article.summary,

    href: `/articles/${article.slug}`,

    category: article.category,
    categorySlug: article.categorySlug,

    district: article.district,
    state: article.state,

    publishedAt: formatPublishedTime(article.publishDate),

    imageLabel: article.category,
    imageTone: imageTones[index % imageTones.length],

    imageUrl: article.primaryImage?.url ?? article.images?.[0]?.url,

    isBreaking: article.isBreaking,
    isFeatured: article.isFeatured,
    districtSlug: article.districtSlug,
  }
}

function uniqueArticles(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>()

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false
    }

    seen.add(item.id)
    return true
  })
}

function buildCategorySections(items: NewsItem[]): CategoryBlock[] {
  const sections = new Map<string, CategoryBlock>()

  for (const item of items) {
    const existing = sections.get(item.categorySlug)

    if (existing) {
      if (existing.items.length < 3) {
        existing.items.push(item)
      }

      continue
    }

    sections.set(item.categorySlug, {
      id: `category-${item.categorySlug}`,
      title: item.category,
      href: `/categories/${item.categorySlug}/articles`,
      items: [item],
    })
  }

  return [...sections.values()].slice(0, 3)
}

function buildDistrictSections(items: NewsItem[]): DistrictBlock[] {
  const sections = new Map<string, DistrictBlock>()

  for (const item of items) {
    if (!item.district || !item.districtSlug) {
      continue
    }

    const existing = sections.get(item.districtSlug)

    if (existing) {
      if (existing.items.length < 3) {
        existing.items.push(item)
      }
      continue
    }

    sections.set(item.districtSlug, {
      id: `district-${item.districtSlug}`,
      name: item.district,
      href: `/districts/${item.districtSlug}/articles`,
      items: [item],
    })
  }

  return [...sections.values()].slice(0, 3)
}
function buildVideoNews(items: ApiArticleSummary[]): VideoItem[] {
  return items
    .filter((item) => item.youtubeVideoId)
    .slice(0, 3)
    .map((item) => ({
      id: `video-${item.articleId}`,
      title: item.title,
      href: `/articles/${item.slug}`,
      youtubeVideoId: item.youtubeVideoId ?? '',
      duration: 'YouTube',
      imageLabel: item.category,
      thumbnailUrl: `https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`,
    }))
}

function buildPhotoGallery(items: ApiArticleSummary[]): GalleryItem[] {
  return items
    .filter((item) => item.images.length > 0)
    .slice(0, 4)
    .map((item, index) => ({
      id: `gallery-${item.articleId}`,

      title: item.title,

      href: `/articles/${item.slug}`,

      imageLabel: item.category,

      imageTone: imageTones[index % imageTones.length],

      imageUrl: item.primaryImage?.url ?? item.images[0]?.url,
    }))
}

function formatPublishedTime(value: string): string {
  return new Intl.DateTimeFormat('hi-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    day: 'numeric',
    month: 'short',
  }).format(new Date(value))
}
