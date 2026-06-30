import { Box, Paper, Stack, Typography } from '@mui/material'
import { ArticleCard } from '@/components/article/ArticleCard'
import { AdvertisementSlot } from '@/components/common/AdvertisementSlot'
import { SectionHeader } from '@/components/common/SectionHeader'
import type { NewsItem } from '@/types/homepage'

type SidebarProps = {
  popularItems: NewsItem[]
}

export function Sidebar({ popularItems }: SidebarProps) {
  return (
    <Box
      component="aside"
      sx={{
        display: { xs: 'none', lg: 'block' },
        position: 'sticky',
        top: 138,
        minWidth: 0,
        alignSelf: 'start',
      }}
    >
      <Stack spacing={2.5}>
        <AdvertisementSlot variant="sidebar" />
        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
          <SectionHeader title="यह भी पढ़ें" />
          <Stack spacing={1.5}>
            {popularItems.slice(0, 4).map((item) => (
              <ArticleCard key={item.id} item={item} variant="compact" />
            ))}
          </Stack>
        </Paper>
        <Paper elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
          <Typography component="h2" variant="h3" sx={{ mb: 1 }}>
            सोनवाणी अपडेट
          </Typography>
          <Typography color="text.secondary">
            ब्रेकिंग, स्थानीय और जिला अपडेट के लिए हमारे सोशल चैनलों से जुड़ें।
          </Typography>
        </Paper>
      </Stack>
    </Box>
  )
}
