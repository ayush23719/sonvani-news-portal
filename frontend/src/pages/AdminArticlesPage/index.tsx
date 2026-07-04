import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import {
  deleteArticle,
  getMyArticles,
  publishArticle,
} from '@/services/adminArticleService'

type Article = {
  articleId: string
  title: string
  status: string
  category?: string
  updatedAt?: string
  publishDate?: string
}
type Resp = { success: boolean; data: { articles: Article[] } }

export function AdminArticlesPage() {
  const qc = useQueryClient()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['adminArticles'],
    queryFn: () => getMyArticles() as Promise<Resp>,
  })
  const pub = useMutation({
    mutationFn: (id: string) => publishArticle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminArticles'] }),
  })
  const dele = useMutation({
    mutationFn: (id: string) => deleteArticle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['adminArticles'] }),
  })
  const articles = data?.data?.articles ?? []
  return (
    <Stack spacing={3}>
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          मेरे समाचार
        </Typography>
        <Button component={RouterLink} to="/admin/articles/new" variant="contained">
          नया समाचार
        </Button>
      </Box>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error">
          समाचार लोड नहीं हो सके।
          <Button onClick={() => refetch()}>पुनः प्रयास करें</Button>
        </Alert>
      )}
      {!isLoading && !error && articles.length === 0 && (
        <Alert severity="info">अभी तक कोई समाचार नहीं है।</Alert>
      )}
      {!isLoading && !error && articles.length > 0 && (
        <>
          {/* Desktop */}
          <Paper
            sx={{
              display: { xs: 'none', md: 'block' },
              overflowX: 'auto',
            }}
          >
            <Table sx={{ minWidth: 850 }}>
              <TableHead>
                <TableRow>
                  <TableCell>शीर्षक</TableCell>
                  <TableCell>स्थिति</TableCell>
                  <TableCell>श्रेणी</TableCell>
                  <TableCell>अपडेट किया गया</TableCell>
                  <TableCell align="right">कार्रवाई</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {articles.map((a) => (
                  <TableRow key={a.articleId + '-' + a.status}>
                    <TableCell>{a.title}</TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        color={a.status === 'PUBLISHED' ? 'success' : 'warning'}
                        label={a.status === 'PUBLISHED' ? 'प्रकाशित' : 'ड्राफ्ट'}
                      />
                    </TableCell>

                    <TableCell>{a.category ?? '-'}</TableCell>

                    <TableCell>
                      {new Date(a.updatedAt ?? a.publishDate ?? '').toLocaleString()}
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          component={RouterLink}
                          to={`/admin/articles/${a.articleId}`}
                        >
                          संपादित करें
                        </Button>

                        {a.status !== 'PUBLISHED' && (
                          <Button
                            size="small"
                            color="success"
                            disabled={pub.isPending}
                            onClick={() => pub.mutate(a.articleId)}
                          >
                            प्रकाशित करें
                          </Button>
                        )}

                        <Button
                          size="small"
                          color="error"
                          disabled={dele.isPending}
                          onClick={() => {
                            if (confirm('क्या आप इस समाचार को हटाना चाहते हैं?'))
                              dele.mutate(a.articleId)
                          }}
                        >
                          हटाएँ
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {/* Mobile */}
          <Stack
            spacing={2}
            sx={{
              display: { xs: 'flex', md: 'none' },
            }}
          >
            {articles.map((a) => (
              <Card key={a.articleId + '-' + a.status}>
                <CardContent>
                  <Stack spacing={2}>
                    <Typography fontWeight={700} fontSize="1rem">
                      {a.title}
                    </Typography>

                    <Chip
                      size="small"
                      sx={{ width: 'fit-content' }}
                      color={a.status === 'PUBLISHED' ? 'success' : 'warning'}
                      label={a.status === 'PUBLISHED' ? 'प्रकाशित' : 'ड्राफ्ट'}
                    />

                    <Divider />

                    <Typography variant="body2">
                      <strong>श्रेणी:</strong> {a.category ?? '-'}
                    </Typography>

                    <Typography variant="body2">
                      <strong>अपडेट:</strong>{' '}
                      {new Date(a.updatedAt ?? a.publishDate ?? '').toLocaleString()}
                    </Typography>

                    <Stack spacing={1}>
                      <Button
                        fullWidth
                        variant="outlined"
                        component={RouterLink}
                        to={`/admin/articles/${a.articleId}`}
                      >
                        ✏️ संपादित करें
                      </Button>

                      {a.status !== 'PUBLISHED' && (
                        <Button
                          fullWidth
                          variant="contained"
                          color="success"
                          disabled={pub.isPending}
                          onClick={() => pub.mutate(a.articleId)}
                        >
                          प्रकाशित करें
                        </Button>
                      )}

                      <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        disabled={dele.isPending}
                        onClick={() => {
                          if (confirm('क्या आप इस समाचार को हटाना चाहते हैं?'))
                            dele.mutate(a.articleId)
                        }}
                      >
                        हटाएँ
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </>
      )}
    </Stack>
  )
}
