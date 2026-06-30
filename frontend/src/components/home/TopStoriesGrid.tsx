import { Box } from '@mui/material'
import { ArticleCard } from '@/components/article/ArticleCard'
import { SectionHeader } from '@/components/common/SectionHeader'
import type { NewsItem } from '@/types/homepage'

type TopStoriesGridProps = {
  items: NewsItem[]
}

export function TopStoriesGrid({ items }: TopStoriesGridProps) {
  return (
    <Box component="section" aria-labelledby="top-stories-title">
      <SectionHeader title="मुख्य खबरें" eyebrow="आज की बड़ी अपडेट" />
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {items.map((item) => (
          <ArticleCard key={item.id} item={item} />
        ))}
      </Box>
    </Box>
  )
}
