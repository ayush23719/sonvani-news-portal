import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import { useNavigate } from 'react-router-dom'
import {
  createArticle,
  updateArticle,
  publishArticle,
  getArticle,
} from '@/services/adminArticleService'
import { useEffect, useState } from 'react'

type ArticleFormProps = {
  mode: 'create' | 'edit'
  articleId?: string
}

type ArticleFormData = {
  title: string
  summary: string
  body: string
  reporterName: string
  category: string
  district: string
  state: string
  youtubeVideoId: string

  isBreaking: boolean
  isFeatured: boolean

  seoTitle: string
  seoDescription: string
  seoKeywords: string

  images: string[]
}

const emptyForm: ArticleFormData = {
  title: '',
  summary: '',
  body: '',
  reporterName: '',
  category: '',
  district: '',
  state: '',
  youtubeVideoId: '',

  isBreaking: false,
  isFeatured: false,

  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',

  images: [],
}

export function ArticleForm({ mode, articleId }: ArticleFormProps) {
  const [form, setForm] = useState<ArticleFormData>(emptyForm)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (mode !== 'edit' || !articleId) {
      return
    }

    const loadArticle = async () => {
      try {
        setLoading(true)

        const response = (await getArticle(articleId)) as {
          data: {
            article: {
              title?: string
              summary?: string
              body?: string
              reporterName?: string
              category?: string
              district?: string
              state?: string
              youtubeVideoId?: string
              isBreaking?: boolean
              isFeatured?: boolean
              seo?: {
                title?: string
                description?: string
                keywords?: string[]
              }
              images?: Array<{
                url: string
              }>
            }
          }
        }

        const article = response.data.article

        setForm({
          title: article.title ?? '',
          summary: article.summary ?? '',
          body: article.body ?? '',
          reporterName: article.reporterName ?? '',
          category: article.category ?? '',
          district: article.district ?? '',
          state: article.state ?? '',
          youtubeVideoId: article.youtubeVideoId ?? '',

          isBreaking: article.isBreaking ?? false,
          isFeatured: article.isFeatured ?? false,

          seoTitle: article.seo?.title ?? '',
          seoDescription: article.seo?.description ?? '',
          seoKeywords: article.seo?.keywords?.join(', ') ?? '',

          images: article.images?.map((image) => image.url) ?? [],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load article.')
      } finally {
        setLoading(false)
      }
    }

    void loadArticle()
  }, [mode, articleId])

  const update =
    (field: keyof ArticleFormData) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value

      setForm((previous) => ({
        ...previous,
        [field]: value,
      }))
    }

  const updateCheckbox =
    (field: keyof ArticleFormData) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((previous) => ({
        ...previous,
        [field]: event.target.checked,
      }))
    }

  const saveDraft = async () => {
    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const payload = {
        title: form.title,
        summary: form.summary,
        body: form.body,
        reporterName: form.reporterName,
        category: form.category,
        district: form.district,
        state: form.state,
        youtubeVideoId: form.youtubeVideoId,
        isBreaking: form.isBreaking,
        isFeatured: form.isFeatured,
        seo: {
          title: form.seoTitle,
          description: form.seoDescription,
          keywords: form.seoKeywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        },
        status: 'DRAFT',
      }

      if (mode === 'create') {
        await createArticle(payload)
      } else if (articleId) {
        await updateArticle(articleId, payload)
      }

      setSuccess('Draft saved successfully.')

      setTimeout(() => {
        navigate('/admin/articles')
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft.')
    } finally {
      setSaving(false)
    }
  }

  const publish = async () => {
    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const payload = {
        title: form.title,
        summary: form.summary,
        body: form.body,
        reporterName: form.reporterName,
        category: form.category,
        district: form.district,
        state: form.state,
        youtubeVideoId: form.youtubeVideoId,
        isBreaking: form.isBreaking,
        isFeatured: form.isFeatured,
        seo: {
          title: form.seoTitle,
          description: form.seoDescription,
          keywords: form.seoKeywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        },
        images: [],
      }

      if (mode === 'create') {
        const createResponse = (await createArticle(payload)) as {
          data: {
            article: {
              articleId: string
            }
          }
        }

        await publishArticle(createResponse.data.article.articleId)
      } else if (articleId) {
        await updateArticle(articleId, payload)
        await publishArticle(articleId)
      }

      setSuccess('Article published successfully.')

      setTimeout(() => {
        navigate('/admin/articles')
      }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to publish article.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          py: 8,
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {mode === 'create' ? 'Create Article' : 'Edit Article'}
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Fill the article details below.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {success && <Alert severity="success">{success}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" fontWeight={700}>
              Article Information
            </Typography>

            <Divider />

            <TextField
              fullWidth
              required
              label="Title"
              value={form.title}
              onChange={update('title')}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Summary"
              value={form.summary}
              onChange={update('summary')}
            />

            <TextField
              fullWidth
              multiline
              rows={12}
              label="Body"
              value={form.body}
              onChange={update('body')}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Reporter Name"
                  value={form.reporterName}
                  onChange={update('reporterName')}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Category"
                  value={form.category}
                  onChange={update('category')}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="District"
                  value={form.district}
                  onChange={update('district')}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="State"
                  value={form.state}
                  onChange={update('state')}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="YouTube URL"
                  value={form.youtubeVideoId}
                  onChange={update('youtubeVideoId')}
                  placeholder="https://youtu.be/..."
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="h6" fontWeight={700}>
              Article Flags
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isBreaking}
                  onChange={updateCheckbox('isBreaking')}
                />
              }
              label="Breaking News"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isFeatured}
                  onChange={updateCheckbox('isFeatured')}
                />
              }
              label="Featured Article"
            />

            <Divider />

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              SEO
            </Typography>

            <TextField
              fullWidth
              label="SEO Title"
              value={form.seoTitle}
              onChange={update('seoTitle')}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="SEO Description"
              value={form.seoDescription}
              onChange={update('seoDescription')}
            />

            <TextField
              fullWidth
              label="SEO Keywords"
              helperText="Comma separated keywords"
              value={form.seoKeywords}
              onChange={update('seoKeywords')}
            />

            <Divider />

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Images
            </Typography>

            <Alert severity="info">
              Image upload will be connected to Amazon S3 in the next milestone.
            </Alert>

            <Button variant="outlined" component="label">
              Upload Image
              <input hidden type="file" accept="image/*" />
            </Button>

            {form.images.length > 0 && (
              <Stack spacing={2}>
                {form.images.map((image, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent>
                      <Typography
                        variant="body2"
                        sx={{
                          wordBreak: 'break-all',
                        }}
                      >
                        {image}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            <Divider />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Button variant="outlined" disabled={saving} onClick={saveDraft}>
                Save Draft
              </Button>

              <Button variant="contained" disabled={saving} onClick={publish}>
                {saving ? <CircularProgress size={22} color="inherit" /> : 'Publish'}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
