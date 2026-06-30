import { Box } from '@mui/material'
import { ArticleCard } from '@/components/article/ArticleCard'
import type { NewsItem } from '@/types/homepage'

type HeroStoryProps = {
  item: NewsItem
}

export function HeroStory({ item }: HeroStoryProps) {
  return (
    <Box component="section" aria-label="प्रमुख खबर">
      <ArticleCard item={item} variant="hero" />
    </Box>
  )
}
