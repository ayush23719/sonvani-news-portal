import CollectionsIcon from '@mui/icons-material/Collections'
import { Box, Card, Typography } from '@mui/material'
import { NewsImage } from '@/components/common/NewsImage'
import type { GalleryItem } from '@/types/homepage'

type PhotoGalleryCardProps = {
  item: GalleryItem
}

export function PhotoGalleryCard({ item }: PhotoGalleryCardProps) {
  return (
    <Card component="article" elevation={0} sx={{ overflow: 'hidden' }}>
      <Box component="a" href={item.href} sx={{ color: 'inherit', display: 'block' }}>
        <Box sx={{ position: 'relative' }}>
          <NewsImage
            label={item.imageLabel}
            imageUrl={item.imageUrl}
            tone={item.imageTone}
            minHeight={170}
          />
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              display: 'inline-flex',
              borderRadius: 1,
              bgcolor: 'rgba(255,255,255,0.92)',
              color: 'primary.main',
              p: 0.6,
            }}
          >
            <CollectionsIcon sx={{ fontSize: 20 }} />
          </Box>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography
            component="h3"
            sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.45 }}
          >
            {item.title}
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}
