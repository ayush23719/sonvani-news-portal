import { Box } from '@mui/material'
import { ArticleList } from '@/components/article/ArticleList'
import { SectionHeader } from '@/components/common/SectionHeader'
import type { NewsItem } from '@/types/homepage'

type LatestNewsSectionProps = {
  items: NewsItem[]
}

export function LatestNewsSection({ items }: LatestNewsSectionProps) {
  return (
    <Box component="section" aria-labelledby="latest-news-title">
      <SectionHeader title="ताज़ा खबरें" eyebrow="लगातार अपडेट" href="/category/latest" />
      <ArticleList items={items} />
    </Box>
  )
}
