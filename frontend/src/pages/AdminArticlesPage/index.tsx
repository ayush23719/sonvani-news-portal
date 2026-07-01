import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
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
          My Articles
        </Typography>
        <Button component={RouterLink} to="/admin/articles/new" variant="contained">
          New Article
        </Button>
      </Box>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error">
          Failed to load articles.<Button onClick={() => refetch()}>Retry</Button>
        </Alert>
      )}
      {!isLoading && !error && articles.length === 0 && (
        <Alert severity="info">No articles yet.</Alert>
      )}
      {!isLoading && !error && articles.length > 0 && (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="right">Actions</TableCell>
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
                      label={a.status}
                    />
                  </TableCell>
                  <TableCell>{a.category ?? '-'}</TableCell>
                  <TableCell>
                    {new Date(a.updatedAt ?? a.publishDate ?? '').toLocaleString()}
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: 'flex-end' }}
                    >
                      <Button
                        size="small"
                        component={RouterLink}
                        to={`/admin/articles/${a.articleId}`}
                      >
                        Edit
                      </Button>
                      {a.status !== 'PUBLISHED' && (
                        <Button
                          size="small"
                          color="success"
                          disabled={pub.isPending}
                          onClick={() => pub.mutate(a.articleId)}
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        size="small"
                        color="error"
                        disabled={dele.isPending}
                        onClick={() => {
                          if (confirm('Delete article?')) dele.mutate(a.articleId)
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Stack>
  )
}
