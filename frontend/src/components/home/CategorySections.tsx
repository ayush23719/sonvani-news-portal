import { Box, Paper, Stack } from '@mui/material'
import { ArticleCard } from '@/components/article/ArticleCard'
import { SectionHeader } from '@/components/common/SectionHeader'
import type { CategoryBlock } from '@/types/homepage'

type CategorySectionsProps = {
  sections: CategoryBlock[]
}

export function CategorySections({ sections }: CategorySectionsProps) {
  return (
    <Box component="section" aria-label="श्रेणीवार खबरें">
      <SectionHeader title="श्रेणीवार खबरें" eyebrow="आपकी पसंद के विषय" />
      <Stack spacing={2.5}>
        {sections.map((section) => (
          <Paper key={section.id} elevation={0} sx={{ border: 1, borderColor: 'divider', p: { xs: 2, md: 2.5 } }}>
            <SectionHeader title={section.title} href={section.href} />
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              }}
            >
              {section.items.map((item) => (
                <ArticleCard key={item.id} item={item} />
              ))}
            </Box>
          </Paper>
        ))}
      </Stack>
    </Box>
  )
}
