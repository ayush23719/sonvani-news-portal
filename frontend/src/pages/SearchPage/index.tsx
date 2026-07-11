import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArticleList } from '@/components/article/ArticleList'
import { searchArticles } from '@/services/searchService'

export function SearchPage() {
  const [searchParams] = useSearchParams()

  const query = searchParams.get('q') ?? ''

  const {
    data = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['search', query],
    queryFn: () => searchArticles(query),
    enabled: query.length > 0,
  })

  if (isLoading) {
    return (
      <Container sx={{ py: 5 }}>
        <Typography>खोजा जा रहा है...</Typography>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 5 }}>
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '1.6rem', md: '2rem' },
              fontWeight: 800,
            }}
          >
            "{query}" के परिणाम
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {data.length} खबरें मिलीं
          </Typography>
        </Box>

        {data.length > 0 ? (
          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              p: 3,
            }}
          >
            <ArticleList items={data} />
          </Paper>
        ) : (
          <Paper
            elevation={0}
            sx={{
              border: 1,
              borderColor: 'divider',
              p: 4,
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h5">कोई समाचार नहीं मिला।</Typography>

              <Typography color="text.secondary">कृपया कोई दूसरा शब्द खोजें।</Typography>

              <Button
                variant="contained"
                onClick={() => void refetch()}
                sx={{ width: 'fit-content' }}
              >
                पुनः प्रयास करें
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Container>
  )
}
