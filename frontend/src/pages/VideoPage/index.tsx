import { Box, Button, Container, Paper, Typography } from '@mui/material'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { VideoCard } from '@/components/media/VideoCard'
import { fetchVideos } from '@/services/videoService'

export function VideoPage() {
  const [searchParams] = useSearchParams()

  const cursor = searchParams.get('cursor') ?? undefined

  const { data, isLoading } = useQuery({
    queryKey: ['videos', cursor],
    queryFn: () => fetchVideos(cursor),
  })

  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>लोड हो रहा है...</Typography>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography
        variant="h1"
        sx={{
          mb: 3,
          fontSize: '2rem',
          fontWeight: 800,
        }}
      >
        वीडियो
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2,1fr)',
              lg: 'repeat(3,1fr)',
            },
          }}
        >
          {data?.items.map((item) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </Box>

        {data?.pagination.hasMore && (
          <Box
            sx={{
              mt: 4,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Button
              variant="outlined"
              href={`?cursor=${encodeURIComponent(data.pagination.nextCursor ?? '')}`}
            >
              और दिखाएं
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  )
}
