import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getJson } from '@/services/apiClient'
import type { Article } from '@/types/news'

type ApiResponse<TData> = {
  success: boolean
  data?: TData
  error?: {
    code: string
    message: string
  }
  requestId: string
}

async function fetchArticleBySlug(slug: string): Promise<Article> {
  const response = await getJson<ApiResponse<Article>>(`/articles/${slug}`)

  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'खबर लोड नहीं हो सकी।')
  }

  return response.data
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

  useEffect(() => {
    if (article) {
      const title = article.seo?.title || article.title
      document.title = `${title} | सोनवानी`
    }
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

  return (
    <Container sx={{ py: { xs: 2.5, md: 4 } }}>
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <article>
          <Stack spacing={{ xs: 2, md: 3 }}>
            <Box>
              <Typography
                component="h1"
                variant="h1"
                sx={{
                  fontSize: { xs: '1.5rem', sm: '1.85rem', md: '2.35rem' },
                  fontWeight: 800,
                  lineHeight: 1.25,
                  mb: 1.5,
                }}
              >
                {article.title}
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.95rem', md: '1rem' },
                  lineHeight: 1.6,
                }}
              >
                {article.summary}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={2}
              sx={{ flexWrap: 'wrap', fontSize: '0.9rem', color: 'text.secondary' }}
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

            <Box
              sx={{
                bgcolor: 'background.default',
                borderRadius: 1,
                overflow: 'hidden',
                aspectRatio: '16 / 9',
                minHeight: 300,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              {article.images && article.images.length > 0 ? (
                <Box
                  component="img"
                  src={article.images[0].url}
                  alt={article.images[0].altText}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement
                    img.style.display = 'none'
                  }}
                />
              ) : null}
            </Box>

            <Box
              sx={{
                fontSize: { xs: '0.95rem', md: '1rem' },
                lineHeight: 1.8,
                '& p': {
                  mb: 1.5,
                  textAlign: 'justify',
                },
              }}
              dangerouslySetInnerHTML={{ __html: article.body }}
            />

            {article.images && article.images.length > 1 && (
              <Box>
                <Typography
                  variant="h3"
                  sx={{
                    fontSize: { xs: '1.1rem', md: '1.25rem' },
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  और चित्र
                </Typography>
                <Stack spacing={2}>
                  {article.images.slice(1).map((image, index) => (
                    <Box key={index}>
                      <Box
                        component="img"
                        src={image.url}
                        alt={image.altText}
                        sx={{
                          width: '100%',
                          maxHeight: 400,
                          objectFit: 'cover',
                          borderRadius: 1,
                          mb: 1,
                        }}
                        onError={(e) => {
                          const img = e.currentTarget as HTMLImageElement
                          img.style.display = 'none'
                        }}
                      />
                      {image.caption && (
                        <Typography
                          color="text.secondary"
                          sx={{ fontSize: '0.85rem', fontStyle: 'italic' }}
                        >
                          {image.caption}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            )}

            {article.category && (
              <Box sx={{ pt: 2, borderTop: 1, borderColor: 'divider' }}>
                <Typography
                  component="span"
                  sx={{ fontWeight: 600, color: 'text.primary', mr: 1 }}
                >
                  श्रेणी:
                </Typography>
                <Typography component="span" color="text.secondary">
                  {article.category}
                </Typography>
              </Box>
            )}
          </Stack>
        </article>
      </Paper>
    </Container>
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
          <Stack direction="row" spacing={2}>
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
