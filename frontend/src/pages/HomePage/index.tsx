import { Box, Container, Stack } from '@mui/material'
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
import {
  breakingNews,
  categorySections,
  districtSections,
  heroStory,
  latestNews,
  photoGallery,
  topStories,
  videoNews,
} from '@/mocks/homepage'

export function HomePage() {
  return (
    <>
      <BreakingNewsTicker items={breakingNews} />
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
            <HeroStory item={heroStory} />
            <TopStoriesGrid items={topStories} />
            <Box sx={{ display: { xs: 'block', lg: 'none' } }}>
              <AdvertisementSlot variant="banner" />
            </Box>
            <LatestNewsSection items={latestNews.slice(1)} />
            <AdvertisementSlot variant="banner" />
            <CategorySections sections={categorySections} />
            <DistrictNewsSection districts={districtSections} />
            <VideoNewsSection items={videoNews} />
            <PhotoGallerySection items={photoGallery} />
          </Stack>
          <Sidebar popularItems={latestNews} />
        </Box>
      </Container>
    </>
  )
}
