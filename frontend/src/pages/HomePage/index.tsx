import { Box, Button, CircularProgress, Container, Paper, Stack, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { BreakingNewsTicker } from '@/components/article/BreakingNewsTicker'
import { AdvertisementSlot } from '@/components/common/AdvertisementSlot'
import { Sidebar } from '@/components/layout/Sidebar'
import { CategorySections } from '@/components/home/CategorySections'
import { DistrictNewsSection } from '@/components/home/DistrictNewsSection'
import { HeroStory } from '@/components/home/HeroStory'
import { LatestNewsSection } from '@/components/home/LatestNewsSection'
import { PhotoGallerySection } from '@/components/home/PhotoGallerySection'
import { TopStoriesGrid } from '@/components/home/TopStoriesGrid'
import { VideoNewsSection } from '@/components/home/VideoNewsSection'
import { fetchHomePageData } from '@/services/homeFeedService'

export function HomePage() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['home-feed'],
    queryFn: ({ signal }) => fetchHomePageData(signal),
  })

  if (isLoading) {
    return <HomePageLoading />
  }

  if (error || !data) {
    return <HomePageError onRetry={() => void refetch()} />
  }

  return (
    <>
      <BreakingNewsTicker items={data.breakingNews} />
      <Container sx={{ py: { xs: 2.5, md: 4 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 3, lg: 3.5 },
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 340px' },
            minWidth: 0,
          }}
        >
          <Stack spacing={{ xs: 3, md: 4 }} sx={{ minWidth: 0 }}>
            <HeroStory item={data.heroStory} />
            <TopStoriesGrid items={data.topStories} />
            <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
              <AdvertisementSlot variant="banner" />
            </Box>
            <LatestNewsSection items={data.latestNews} />
            <AdvertisementSlot variant="banner" />
            <CategorySections sections={data.categorySections} />
            <DistrictNewsSection districts={data.districtSections} />
            <VideoNewsSection items={data.videoNews} />
            <PhotoGallerySection items={data.photoGallery} />
          </Stack>
          <Sidebar popularItems={data.latestNews} />
        </Box>
      </Container>
    </>
  )
}

function HomePageLoading() {
  return (
    <Container sx={{ py: { xs: 6, md: 10 } }}>
      <Paper
        elevation={0}
        sx={{
          display: 'grid',
          minHeight: 280,
          placeItems: 'center',
          border: 1,
          borderColor: 'divider',
          p: 4,
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
          <CircularProgress color="secondary" />
          <Typography sx={{ fontWeight: 800 }}>खबरें लोड हो रही हैं...</Typography>
        </Stack>
      </Paper>
    </Container>
  )
}

function HomePageError({ onRetry }: { onRetry: () => void }) {
  return (
    <Container sx={{ py: { xs: 6, md: 10 } }}>
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
            खबरें लोड नहीं हो सकीं
          </Typography>
          <Typography color="text.secondary">
            नेटवर्क या सर्वर समस्या के कारण होम फीड उपलब्ध नहीं है।
          </Typography>
          <Button onClick={onRetry} variant="contained">
            फिर से कोशिश करें
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
