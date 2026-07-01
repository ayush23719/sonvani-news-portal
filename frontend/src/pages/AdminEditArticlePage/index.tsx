import { useParams } from 'react-router-dom'
import { Alert } from '@mui/material'
import { ArticleForm } from '@/components/article/ArticleForm'

export function AdminEditArticlePage() {
  const { articleId } = useParams()

  if (!articleId) {
    return <Alert severity="error">Article ID is missing.</Alert>
  }

  return <ArticleForm mode="edit" articleId={articleId} />
}
