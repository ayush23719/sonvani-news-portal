import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArticleList } from '@/components/article/ArticleList'
import { getJson } from '@/services/apiClient'
import type { ArticleImage, SeoMetadata } from '@/types/news'
import type { NewsItem } from '@/types/homepage'

type ListingKind = 'category' | 'district' | 'state'

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

type ListingApiResponse = {
  items: ApiArticleSummary[]
  pagination: ApiPagination
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

type ListingPageProps = {
  kind: ListingKind
  heading: string
  emptyMessage: string
}

const pageSize = 12

async function fetchListing(
  kind: ListingKind,
  slug: string,
  cursor?: string,
): Promise<ListingApiResponse> {
  const query = new URLSearchParams({ limit: String(pageSize) })

  if (cursor) {
    query.set('cursor', cursor)
  }

  const response = await getJson<ApiResponse<ListingApiResponse>>(
    `/${
      kind === 'category' ? 'categories' : kind === 'district' ? 'districts' : 'states'
    }/${slug}/articles?${query.toString()}`,
  )

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'सूची लोड नहीं हो सकी।')
  }

  return response.data
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
    state: article.state,

    publishedAt: formatPublishedTime(article.publishDate),

    imageUrl:
      article.primaryImage?.url ??
      article.images?.find((img) => img.isPrimary)?.url ??
      article.images?.[0]?.url,

    imageLabel: article.category,
    imageTone: 'navy',

    isBreaking: article.isBreaking,
    isFeatured: article.isFeatured,
  }
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

export function ListingPage({ kind, heading, emptyMessage }: ListingPageProps) {
  const { categorySlug, districtSlug, stateSlug } = useParams<{
    categorySlug?: string
    districtSlug?: string
    stateSlug?: string
  }>()
  const [searchParams] = useSearchParams()
  const slug = useMemo(() => {
    if (kind === 'category') {
      return categorySlug ?? ''
    }

    if (kind === 'district') {
      return districtSlug ?? ''
    }

    return stateSlug ?? ''
  }, [categorySlug, districtSlug, stateSlug, kind])
  const cursor = searchParams.get('cursor') ?? undefined

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['listing', kind, slug, cursor],
    queryFn: () => fetchListing(kind, slug, cursor),
    enabled: !!slug,
  })

  useEffect(() => {
    document.title = `${heading} | सोनवानी`
  }, [heading])

  if (!slug) {
    return (
      <ListingState
        title="खबरें उपलब्ध नहीं हैं"
        description="यह पेज सही रूप से खोल नहीं सका।"
      />
    )
  }

  if (isLoading) {
    return <ListingLoading />
  }

  if (error || !data) {
    return (
      <ListingState
        title="खबरें लोड नहीं हो सकीं"
        description="कृपया बाद में कोशिश करें।"
        onRetry={() => void refetch()}
      />
    )
  }

  const items = data.items.map(toNewsItem)

  return (
    <Container sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography
            component="h1"
            variant="h1"
            sx={{ fontSize: { xs: '1.6rem', md: '2.1rem' }, fontWeight: 800 }}
          >
            {heading}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {items.length > 0 ? `${items.length} खबरें दिखाई गईं` : emptyMessage}
          </Typography>
        </Box>
        {items.length > 0 ? (
          <Paper
            elevation={0}
            sx={{ border: 1, borderColor: 'divider', p: { xs: 2, md: 3 } }}
          >
            <ArticleList items={items} />
            {data.pagination.hasMore ? (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  href={`?cursor=${encodeURIComponent(data.pagination.nextCursor ?? '')}`}
                  variant="outlined"
                >
                  और दिखाएं
                </Button>
              </Box>
            ) : null}
          </Paper>
        ) : (
          <ListingState title="कोई खबर नहीं मिली" description={emptyMessage} />
        )}
      </Stack>
    </Container>
  )
}

function ListingLoading() {
  return (
    <Container sx={{ py: { xs: 4, md: 8 } }}>
      <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', p: 4 }}>
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <CircularProgress color="secondary" />
          <Typography sx={{ fontWeight: 800 }}>खबरें लोड हो रही हैं...</Typography>
        </Stack>
      </Paper>
    </Container>
  )
}

function ListingState({
  title,
  description,
  onRetry,
}: {
  title: string
  description: string
  onRetry?: () => void
}) {
  return (
    <Container sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{ border: 1, borderColor: 'divider', p: { xs: 3, md: 4 } }}
      >
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Typography component="h1" variant="h1">
            {title}
          </Typography>
          <Typography color="text.secondary">{description}</Typography>
          {onRetry ? (
            <Button onClick={onRetry} variant="contained">
              फिर से कोशिश करें
            </Button>
          ) : null}
        </Stack>
      </Paper>
    </Container>
  )
}
