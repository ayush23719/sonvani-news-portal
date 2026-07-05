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
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { uploadImage } from '@/services/mediaService'
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

type ArticleImage = {
  url: string
  altText: string
  caption: string
  credit: string
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

  images: ArticleImage[]
}

const emptyForm: ArticleFormData = {
  title: '',
  summary: '',
  body: '',
  reporterName: '',
  category: 'जनरल',
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

const ARTICLE_CATEGORIES = [
  'जनरल',
  'देश',
  'क्राइम',
  'खेल',
  'राजनीति',
  'धर्म',
  'स्वास्थ्य',
  'बिजनेस',
  'वीडियो',
]

export function ArticleForm({ mode, articleId }: ArticleFormProps) {
  const [form, setForm] = useState<ArticleFormData>(emptyForm)

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()
  const cancelEditing = () => {
    const confirmed = window.confirm('क्या आप बिना सहेजे वापस जाना चाहते हैं?')

    if (!confirmed) {
      return
    }

    navigate('/admin/articles')
  }

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
                altText?: string
                caption?: string
                credit?: string
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
          category: ARTICLE_CATEGORIES.includes(article.category ?? '')
            ? article.category!
            : 'जनरल',
          district: article.district ?? '',
          state: article.state ?? '',
          youtubeVideoId: article.youtubeVideoId ?? '',

          isBreaking: article.isBreaking ?? false,
          isFeatured: article.isFeatured ?? false,

          seoTitle: article.seo?.title ?? '',
          seoDescription: article.seo?.description ?? '',
          seoKeywords: article.seo?.keywords?.join(', ') ?? '',

          images:
            article.images?.map((image) => ({
              url: image.url,
              altText: image.altText ?? '',
              caption: image.caption ?? '',
              credit: image.credit ?? '',
            })) ?? [],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'समाचार लोड नहीं हो सका।')
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
          title: form.seoTitle || form.title,
          description: form.seoDescription || form.summary,
          keywords: form.seoKeywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        },
        status: 'DRAFT',
        images: form.images.map((image, index) => ({
          url: image.url,
          altText: image.altText,
          caption: image.caption,
          credit: image.credit,
          sortOrder: index,
          isPrimary: index === 0,
        })),
      }

      if (mode === 'create') {
        await createArticle(payload)
      } else if (articleId) {
        await updateArticle(articleId, payload)
      }

      setSuccess('ड्राफ्ट सफलतापूर्वक सहेजा गया।')

      setTimeout(() => {
        navigate('/admin/articles')
      }, 1000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ड्राफ्ट सहेजने में विफल।')
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
          title: form.seoTitle || form.title,
          description: form.seoDescription || form.summary,
          keywords: form.seoKeywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
        },
        images: form.images.map((image, index) => ({
          url: image.url,
          altText: image.altText,
          caption: image.caption,
          credit: image.credit,
          sortOrder: index,
          isPrimary: index === 0,
        })),
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

      setSuccess('समाचार सफलतापूर्वक प्रकाशित किया गया।')

      setTimeout(() => {
        navigate('/admin/articles')
      }, 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'समाचार प्रकाशित नहीं हो सका।')
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
          {mode === 'create' ? 'नया समाचार' : 'समाचार संपादित करें'}
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 1 }}>
          नीचे समाचार की पूरी जानकारी भरें।
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {success && <Alert severity="success">{success}</Alert>}

      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              समाचार की जानकारी
            </Typography>

            <Divider />

            <TextField
              fullWidth
              required
              label="शीर्षक"
              value={form.title}
              onChange={update('title')}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="संक्षेप"
              value={form.summary}
              onChange={update('summary')}
            />

            <TextField
              fullWidth
              multiline
              rows={12}
              label="समाचार"
              value={form.body}
              onChange={update('body')}
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="संवाददाता का नाम"
                  value={form.reporterName}
                  onChange={update('reporterName')}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>श्रेणी</InputLabel>

                  <Select
                    label="श्रेणी"
                    value={form.category}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        category: event.target.value,
                      }))
                    }
                  >
                    {ARTICLE_CATEGORIES.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="जिला"
                  value={form.district}
                  onChange={update('district')}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="राज्य"
                  value={form.state}
                  onChange={update('state')}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="यूट्यूब लिंक"
                  value={form.youtubeVideoId}
                  onChange={update('youtubeVideoId')}
                  placeholder="https://youtu.be/..."
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              समाचार के झंडे
            </Typography>

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isBreaking}
                  onChange={updateCheckbox('isBreaking')}
                />
              }
              label="ताज़ा समाचार"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isFeatured}
                  onChange={updateCheckbox('isFeatured')}
                />
              }
              label="विशेष समाचार"
            />

            <Divider />

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 700 }}>उन्नत विकल्प (SEO)</Typography>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    label="एसईओ शीर्षक"
                    value={form.seoTitle}
                    onChange={update('seoTitle')}
                  />

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="एसईओ विवरण"
                    value={form.seoDescription}
                    onChange={update('seoDescription')}
                  />

                  <TextField
                    fullWidth
                    label="एसईओ कीवर्ड"
                    helperText="कॉमा (,) से अलग करें"
                    value={form.seoKeywords}
                    onChange={update('seoKeywords')}
                  />
                </Stack>
              </AccordionDetails>
            </Accordion>

            <Divider />

            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              चित्र
            </Typography>

            <Alert severity="info">
              चित्र अपलोड करें। चाहें तो प्रत्येक चित्र के लिए विवरण, कैप्शन और
              फ़ोटोग्राफ़र का नाम भी भर सकते हैं।
            </Alert>

            <Button variant="outlined" component="label" disabled={saving}>
              चित्र अपलोड करें
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0]

                  if (!file) return

                  try {
                    setSaving(true)

                    const imageUrl = await uploadImage(file)

                    setForm((previous) => ({
                      ...previous,
                      images: [
                        ...previous.images,
                        {
                          url: imageUrl,
                          altText: '',
                          caption: '',
                          credit: '',
                        },
                      ],
                    }))
                  } catch {
                    setError('चित्र अपलोड नहीं हो सका।')
                  } finally {
                    setSaving(false)
                  }
                }}
              />
            </Button>

            {form.images.length > 0 && (
              <Stack spacing={2}>
                {form.images.map((image, index) => (
                  <Card key={index} variant="outlined">
                    <CardContent>
                      <Stack spacing={2}>
                        <Box
                          component="img"
                          src={image.url}
                          alt={image.altText}
                          sx={{
                            width: 220,
                            maxWidth: '100%',
                            borderRadius: 2,
                          }}
                        />

                        <TextField
                          label="चित्र विवरण (Alt Text)"
                          value={image.altText}
                          onChange={(e) => {
                            const images = [...form.images]
                            images[index].altText = e.target.value
                            setForm((prev) => ({ ...prev, images }))
                          }}
                        />

                        <TextField
                          label="कैप्शन"
                          value={image.caption}
                          onChange={(e) => {
                            const images = [...form.images]
                            images[index].caption = e.target.value
                            setForm((prev) => ({ ...prev, images }))
                          }}
                        />

                        <TextField
                          label="फ़ोटोग्राफ़र / श्रेय"
                          value={image.credit}
                          onChange={(e) => {
                            const images = [...form.images]
                            images[index].credit = e.target.value
                            setForm((prev) => ({ ...prev, images }))
                          }}
                        />
                        <Button
                          color="error"
                          variant="outlined"
                          onClick={() => {
                            const images = form.images.filter((_, i) => i !== index)

                            setForm((prev) => ({
                              ...prev,
                              images,
                            }))
                          }}
                        >
                          चित्र हटाएँ
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}

            <Divider />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Button
                color="inherit"
                variant="outlined"
                disabled={saving}
                onClick={cancelEditing}
              >
                रद्द करें
              </Button>

              <Stack direction="row" spacing={2}>
                <Button variant="outlined" disabled={saving} onClick={saveDraft}>
                  ड्राफ्ट सहेजें
                </Button>

                <Button variant="contained" disabled={saving} onClick={publish}>
                  {saving ? (
                    <CircularProgress size={22} color="inherit" />
                  ) : (
                    'प्रकाशित करें'
                  )}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
