import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArticleCard } from '@/components/article/ArticleCard'
import { AdvertisementSlot } from '@/components/common/AdvertisementSlot'
import { SectionHeader } from '@/components/common/SectionHeader'
import { getJson } from '@/services/apiClient'
import { env } from '@/config/env'
import type { NewsItem } from '@/types/homepage'
import type { Article, ArticleImage } from '@/types/news'
import ShareIcon from '@mui/icons-material/Share'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import FacebookIcon from '@mui/icons-material/Facebook'
import XIcon from '@mui/icons-material/X'
import InstagramIcon from '@mui/icons-material/Instagram'
import { IconButton, Snackbar } from '@mui/material'

type ApiResponse<TData> = {
  success: boolean
  data?: TData
  error?: {
    code: string
    message: string
  }
  requestId: string
}

type ArticleSummary = Omit<Article, 'body'> & {
  primaryImage?: ArticleImage
  status?: string
}

type ArticleListingResponse = {
  items: ArticleSummary[]
}

type HomeFeedApiData = {
  latestArticles: ArticleListingResponse
  featuredArticles: ArticleListingResponse
  breakingNews: ArticleListingResponse
}

async function fetchArticleBySlug(slug: string): Promise<Article> {
  const response = await getJson<ApiResponse<Article>>(`/articles/${slug}`)

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'खबर लोड नहीं हो सकी।')
  }

  return response.data
}

async function fetchCategoryArticles(categorySlug: string): Promise<ArticleSummary[]> {
  const response = await getJson<ApiResponse<ArticleListingResponse>>(
    `/categories/${encodeURIComponent(categorySlug)}/articles?limit=8`,
  )

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'संबंधित खबरें लोड नहीं हो सकीं।')
  }

  return response.data.items
}

async function fetchHomeArticles(): Promise<ArticleSummary[]> {
  const response = await getJson<ApiResponse<HomeFeedApiData>>('/home')

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'अन्य खबरें लोड नहीं हो सकीं।')
  }

  return [
    ...response.data.featuredArticles.items,
    ...response.data.breakingNews.items,
    ...response.data.latestArticles.items,
  ]
}

async function fetchRelatedArticles(article: Article): Promise<NewsItem[]> {
  const related = new Map<string, ArticleSummary>()

  if (article.categorySlug) {
    const categoryArticles = await fetchCategoryArticles(article.categorySlug).catch(
      () => [],
    )
    addRelatedArticles(related, categoryArticles, article)
  }

  if (related.size < 4) {
    const homeArticles = await fetchHomeArticles().catch((error: unknown) => {
      if (related.size > 0) {
        return []
      }

      throw error
    })

    addRelatedArticles(related, homeArticles, article)
  }

  return [...related.values()].slice(0, 4).map(toRelatedNewsItem)
}

function addRelatedArticles(
  related: Map<string, ArticleSummary>,
  articles: ArticleSummary[],
  currentArticle: Article,
) {
  for (const item of articles) {
    if (related.size >= 4) {
      return
    }

    if (
      item.articleId === currentArticle.articleId ||
      item.slug === currentArticle.slug
    ) {
      continue
    }

    if (!related.has(item.articleId)) {
      related.set(item.articleId, item)
    }
  }
}

function toRelatedNewsItem(article: ArticleSummary, index: number): NewsItem {
  const tones: NewsItem['imageTone'][] = ['navy', 'red', 'green', 'amber']

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
    publishedAt: formatPublishedTime(article.publishDate),
    imageLabel: article.category,
    imageTone: tones[index % tones.length],
    imageUrl:
      article.primaryImage?.url ??
      article.images?.find((image) => image.isPrimary)?.url ??
      article.images?.[0]?.url,
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

function extractYoutubeId(value?: string) {
  if (!value) return ''

  if (!value.includes('youtube') && !value.includes('youtu.be')) {
    return value
  }

  try {
    const url = new URL(value)

    if (url.hostname.includes('youtu.be')) {
      return url.pathname.replace('/', '')
    }

    return url.searchParams.get('v') ?? ''
  } catch {
    return value
  }
}

export function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const {
    data: article,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['article', slug],
    queryFn: () => fetchArticleBySlug(slug!),
    enabled: !!slug,
  })
  const {
    data: relatedArticles = [],
    error: relatedError,
    isLoading: isRelatedLoading,
  } = useQuery({
    queryKey: ['related-articles', article?.articleId, article?.categorySlug],
    queryFn: () => fetchRelatedArticles(article!),
    enabled: Boolean(article),
    staleTime: 5 * 60 * 1000,
  })
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')

  useEffect(() => {
    if (!article) {
      return
    }

    const title = article.seo?.title || article.title
    const description = article.seo?.description || article.summary
    const siteDomain = (env.siteDomain || window.location.origin).replace(/\/$/, '')
    const canonicalUrl = `${siteDomain}/articles/${encodeURIComponent(article.slug)}`
    const imageUrlCandidate =
      article.images?.find((image) => image.isPrimary)?.url ||
      article.seo?.ogImage ||
      '/brand/sonvani-logo.svg'
    const imageUrl = imageUrlCandidate.startsWith('/')
      ? `${siteDomain}${imageUrlCandidate}`
      : imageUrlCandidate

    document.title = `${title} | सोनवानी`

    const metaTags = [
      ['description', description],
      ['og:title', title],
      ['og:description', description],
      ['og:type', 'article'],
      ['og:url', canonicalUrl],
      ['og:site_name', 'Son Vani'],
      ['twitter:card', 'summary_large_image'],
      ['twitter:title', title],
      ['twitter:description', description],
    ] as const

    metaTags.forEach(([property, content]) => {
      const element =
        document.querySelector(`meta[name="${property}"]`) ||
        document.querySelector(`meta[property="${property}"]`)
      if (element) {
        element.setAttribute('content', content)
        return
      }

      const newElement = document.createElement('meta')
      if (property.startsWith('og:') || property.startsWith('twitter:')) {
        newElement.setAttribute('property', property)
      } else {
        newElement.setAttribute('name', property)
      }
      newElement.setAttribute('content', content)
      document.head.appendChild(newElement)
    })

    const imageElement =
      document.querySelector('meta[property="og:image"]') ||
      document.querySelector('meta[name="twitter:image"]')
    if (imageElement) {
      imageElement.setAttribute('content', imageUrl)
    } else {
      const fallbackImage = document.createElement('meta')
      fallbackImage.setAttribute('property', 'og:image')
      fallbackImage.setAttribute('content', imageUrl)
      document.head.appendChild(fallbackImage)
    }

    const twitterImage = document.querySelector('meta[name="twitter:image"]')
    if (twitterImage) {
      twitterImage.setAttribute('content', imageUrl)
    } else {
      const newTwitterImage = document.createElement('meta')
      newTwitterImage.setAttribute('name', 'twitter:image')
      newTwitterImage.setAttribute('content', imageUrl)
      document.head.appendChild(newTwitterImage)
    }

    let canonical = document.querySelector(
      'link[rel="canonical"]',
    ) as HTMLLinkElement | null
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)
  }, [article])

  if (!slug) {
    return <ArticleNotFound />
  }

  if (isLoading) {
    return <ArticleLoading />
  }

  if (error || !article) {
    return <ArticleNotFound onRetry={() => void refetch()} />
  }
  const articleUrl = decodeURI(window.location.href)

  const shareWhatsapp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(article.title + '\n' + articleUrl)}`,
      '_blank',
    )
  }

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`,
      '_blank',
    )
  }

  const shareX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        article.title,
      )}&url=${encodeURIComponent(articleUrl)}`,
      '_blank',
    )
  }

  const shareInstagram = async () => {
    await navigator.clipboard.writeText(articleUrl)

    setSnackbarMessage('Instagram पर सीधे शेयर करना संभव नहीं है। लिंक कॉपी हो गया है।')
    setSnackbarOpen(true)
  }
  const shareArticle = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.summary,
          url: articleUrl,
        })
        return
      } catch {
        // user cancelled or sharing failed
      }
    }

    await navigator.clipboard.writeText(articleUrl)

    setSnackbarMessage('लिंक कॉपी हो गया।')
    setSnackbarOpen(true)
  }
  const youtubeId = extractYoutubeId(article.youtubeVideoId)
  const paragraphs = article.body
    .split('\n')
    .filter((paragraph) => paragraph.trim() !== '')
  const midArticleAdIndex =
    paragraphs.length >= 4
      ? Math.max(
          1,
          Math.min(paragraphs.length - 2, Math.floor(paragraphs.length / 2) - 1),
        )
      : -1

  return (
    <Container
      maxWidth="lg"
      sx={{
        py: {
          xs: 3,
          md: 5,
        },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          borderRadius: 3,
          p: {
            xs: 2.5,
            sm: 4,
            md: 5,
          },
        }}
      >
        <article
          style={{
            maxWidth: 760,
            margin: '0 auto',
          }}
        >
          <Stack spacing={{ xs: 3, md: 4 }}>
            <Box>
              <Typography
                component="h1"
                variant="h1"
                sx={{
                  fontSize: {
                    xs: '1.55rem',
                    sm: '2rem',
                    md: '2.35rem',
                  },
                  fontWeight: 800,
                  lineHeight: 1.35,
                  mb: 2,
                }}
              >
                {article.title}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  lineHeight: 1.8,
                  fontWeight: 500,
                  maxWidth: 700,
                }}
              >
                {article.summary}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={3}
              sx={{
                flexWrap: 'wrap',
                rowGap: 1,
                pb: 2,
                borderBottom: 1,
                borderColor: 'divider',
                color: 'text.secondary',
                fontSize: '.9rem',
              }}
            >
              {article.reporterName && (
                <Box>
                  <Typography
                    component="span"
                    sx={{ fontWeight: 600, color: 'text.primary' }}
                  >
                    संवाददाता:{' '}
                  </Typography>
                  {article.reporterName}
                </Box>
              )}
              <Box>
                <Typography
                  component="span"
                  sx={{ fontWeight: 600, color: 'text.primary' }}
                >
                  प्रकाशित:{' '}
                </Typography>
                {new Date(article.publishDate).toLocaleDateString('hi-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Box>
              {article.district && (
                <Box>
                  <Typography
                    component="span"
                    sx={{ fontWeight: 600, color: 'text.primary' }}
                  >
                    जिला:{' '}
                  </Typography>
                  {article.district}
                </Box>
              )}
              {article.state && (
                <Box>
                  <Typography
                    component="span"
                    sx={{ fontWeight: 600, color: 'text.primary' }}
                  >
                    राज्य:{' '}
                  </Typography>
                  {article.state}
                </Box>
              )}
            </Stack>
            <Stack
              direction="row"
              spacing={1}
              sx={{
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 700,
                  mr: 1,
                }}
              >
                साझा करें:
              </Typography>

              <IconButton color="success" onClick={shareWhatsapp}>
                <WhatsAppIcon />
              </IconButton>

              <IconButton color="primary" onClick={shareFacebook}>
                <FacebookIcon />
              </IconButton>

              <IconButton onClick={shareX}>
                <XIcon />
              </IconButton>

              <IconButton color="secondary" onClick={shareInstagram}>
                <InstagramIcon />
              </IconButton>

              <IconButton onClick={shareArticle}>
                <ShareIcon />
              </IconButton>
            </Stack>

            <AdvertisementSlot variant="banner" minHeight={90} />

            {article.images?.length > 0 && (
              <Box>
                <Box
                  component="img"
                  src={article.images[0].url}
                  alt={article.images[0].altText || article.title}
                  sx={{
                    width: '100%',
                    maxHeight: 380,
                    objectFit: 'cover',
                    borderRadius: 3,
                    display: 'block',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />

                {(article.images[0].caption || article.images[0].credit) && (
                  <Box
                    sx={{
                      mt: 1,
                      px: 1,
                    }}
                  >
                    {article.images[0].caption && (
                      <Typography
                        sx={{
                          fontSize: '.9rem',
                          color: 'text.primary',
                          fontWeight: 500,
                        }}
                      >
                        {article.images[0].caption}
                      </Typography>
                    )}

                    {article.images[0].credit && (
                      <Typography
                        sx={{
                          mt: 0.4,
                          fontSize: '.8rem',
                          color: 'text.secondary',
                        }}
                      >
                        फोटो : {article.images[0].credit}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
            {article.youtubeVideoId && (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  वीडियो
                </Typography>

                <Box
                  sx={{
                    position: 'relative',
                    paddingBottom: '56.25%',
                    height: 0,
                    overflow: 'hidden',
                    borderRadius: 2,
                    boxShadow: 2,
                  }}
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}`}
                    title="YouTube Video"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 0,
                    }}
                  />
                </Box>
              </Paper>
            )}

            <Box>
              {paragraphs.map((paragraph, index) => (
                <Fragment key={index}>
                  <Typography
                    component="p"
                    sx={{
                      mb: 2.8,
                      fontSize: {
                        xs: '1rem',
                        md: '1.08rem',
                      },
                      lineHeight: 2,
                      textAlign: 'justify',
                    }}
                  >
                    {paragraph}
                  </Typography>
                  {index === midArticleAdIndex ? (
                    <Box sx={{ my: { xs: 3, md: 4 } }}>
                      <AdvertisementSlot variant="banner" minHeight={90} />
                    </Box>
                  ) : null}
                </Fragment>
              ))}
            </Box>

            {article.images?.length > 1 && (
              <Box sx={{ mt: 3 }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                  }}
                >
                  अन्य चित्र
                </Typography>

                <Stack spacing={5}>
                  {article.images.slice(1).map((image, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        component="img"
                        src={image.url}
                        alt={image.altText || article.title}
                        sx={{
                          width: '100%',
                          maxHeight: 360,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />

                      <Box sx={{ p: 2 }}>
                        {image.caption && (
                          <Typography
                            sx={{
                              fontWeight: 600,
                              fontSize: '.95rem',
                            }}
                          >
                            {image.caption}
                          </Typography>
                        )}

                        {image.credit && (
                          <Typography
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                              fontSize: '.82rem',
                            }}
                          >
                            फोटो : {image.credit}
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {article.category && (
              <Box
                sx={{
                  pt: 3,
                  mt: 2,
                  borderTop: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography
                  component="span"
                  sx={{ fontWeight: 600, color: 'text.primary', mr: 1 }}
                >
                  श्रेणी:
                </Typography>
                <Typography
                  component="span"
                  sx={{
                    bgcolor: 'secondary.main',
                    color: '#fff',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 10,
                    fontWeight: 600,
                  }}
                >
                  {article.category}
                </Typography>
              </Box>
            )}

            <AdvertisementSlot variant="banner" minHeight={96} />
          </Stack>
        </article>
      </Paper>
      <RelatedArticlesSection
        error={relatedError}
        isLoading={isRelatedLoading}
        items={relatedArticles}
      />
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  )
}

function RelatedArticlesSection({
  error,
  isLoading,
  items,
}: {
  error: unknown
  isLoading: boolean
  items: NewsItem[]
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        mt: { xs: 3, md: 4 },
        border: 1,
        borderColor: 'divider',
        p: { xs: 2, md: 3 },
      }}
    >
      <SectionHeader title="यह खबरें भी पढ़ें" />

      {isLoading ? (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <CircularProgress size={22} color="secondary" />
          <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
            संबंधित खबरें लोड हो रही हैं...
          </Typography>
        </Stack>
      ) : items.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridAutoColumns: { xs: 'minmax(240px, 82vw)', sm: 'auto' },
            gridAutoFlow: { xs: 'column', sm: 'row' },
            gridTemplateColumns: {
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            overflowX: { xs: 'auto', sm: 'visible' },
            pb: { xs: 1, sm: 0 },
            scrollSnapType: { xs: 'x proximity', sm: 'none' },
            '& > *': {
              minWidth: 0,
              scrollSnapAlign: 'start',
            },
          }}
        >
          {items.map((item) => (
            <Box key={item.id}>
              <ArticleCard item={item} variant="compact" />
            </Box>
          ))}
        </Box>
      ) : (
        <Typography color="text.secondary">
          {error
            ? 'संबंधित खबरें अभी लोड नहीं हो सकीं।'
            : 'अभी अन्य खबरें उपलब्ध नहीं हैं।'}
        </Typography>
      )}
    </Paper>
  )
}

function ArticleLoading() {
  return (
    <Container sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          p: 4,
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <CircularProgress color="secondary" />
          <Typography sx={{ fontWeight: 800 }}>खबर लोड हो रही है...</Typography>
        </Stack>
      </Paper>
    </Container>
  )
}

function ArticleNotFound({ onRetry }: { onRetry?: () => void } = {}) {
  return (
    <Container sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          p: { xs: 3, md: 4 },
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Typography component="h1" variant="h1">
            खबर उपलब्ध नहीं है
          </Typography>
          <Typography color="text.secondary">
            जिस खबर को आप खोलना चाहते हैं, वह अभी उपलब्ध नहीं है या हटा दी गई है।
          </Typography>
          <Stack
            direction="row"
            spacing={3}

            sx={{
              pb: 2,
              borderBottom: 1,
              borderColor: 'divider',
              color: 'text.secondary',
              fontSize: '.9rem',
              flexWrap: 'wrap',
            }}
          >
            {onRetry && (
              <Button onClick={onRetry} variant="contained">
                फिर से कोशिश करें
              </Button>
            )}
            <Button href="/" variant="outlined">
              होम पर जाएं
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}
