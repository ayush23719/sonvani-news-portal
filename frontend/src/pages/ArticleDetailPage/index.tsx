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
  const youtubeId = extractYoutubeId(article.youtubeVideoId)
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
              {article.body
                .split('\n')
                .filter((paragraph) => paragraph.trim() !== '')
                .map((paragraph, index) => (
                  <Typography
                    key={index}
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
          <Stack
            direction="row"
            spacing={3}
            flexWrap="wrap"
            sx={{
              pb: 2,
              borderBottom: 1,
              borderColor: 'divider',
              color: 'text.secondary',
              fontSize: '.9rem',
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
