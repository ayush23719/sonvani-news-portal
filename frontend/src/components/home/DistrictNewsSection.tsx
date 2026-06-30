import LocationOnIcon from '@mui/icons-material/LocationOn'
import { Box, Button, Paper, Stack, Typography } from '@mui/material'
import { ArticleCard } from '@/components/article/ArticleCard'
import { SectionHeader } from '@/components/common/SectionHeader'
import type { DistrictBlock } from '@/types/homepage'

type DistrictNewsSectionProps = {
  districts: DistrictBlock[]
}

export function DistrictNewsSection({ districts }: DistrictNewsSectionProps) {
  return (
    <Box component="section" aria-label="ज़िले की खबरें">
      <SectionHeader title="ज़िले की खबरें" eyebrow="आपके आसपास" />
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
        }}
      >
        {districts.map((district) => (
          <Paper key={district.id} elevation={0} sx={{ border: 1, borderColor: 'divider', p: 2 }}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography component="h3" sx={{ display: 'inline-flex', gap: 0.5, fontWeight: 900 }}>
                <LocationOnIcon sx={{ color: 'secondary.main' }} />
                {district.name}
              </Typography>
              <Button href={district.href} size="small">
                देखें
              </Button>
            </Stack>
            <Stack spacing={1.5}>
              {district.items.map((item) => (
                <ArticleCard key={item.id} item={item} variant="compact" />
              ))}
            </Stack>
          </Paper>
        ))}
      </Box>
    </Box>
  )
}
