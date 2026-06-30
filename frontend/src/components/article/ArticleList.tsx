import { Stack } from '@mui/material'
import { ArticleCard } from './ArticleCard'
import type { NewsItem } from '@/types/homepage'

type ArticleListProps = {
  items: NewsItem[]
}

export function ArticleList({ items }: ArticleListProps) {
  return (
    <Stack spacing={1.5}>
      {items.map((item) => (
        <ArticleCard key={item.id} item={item} variant="horizontal" />
      ))}
    </Stack>
  )
}
