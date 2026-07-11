import { Box } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { VideoCard } from '@/components/media/VideoCard'
import type { VideoItem } from '@/types/homepage'

type VideoNewsSectionProps = {
  items: VideoItem[]
}

export function VideoNewsSection({ items }: VideoNewsSectionProps) {
  return (
    <Box component="section" aria-label="वीडियो खबरें">
      <SectionHeader title="वीडियो" eyebrow="ग्राउंड रिपोर्ट" href="/video" />
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
        }}
      >
        {items.map((item) => (
          <VideoCard key={item.id} item={item} />
        ))}
      </Box>
    </Box>
  )
}
