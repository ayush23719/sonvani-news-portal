import { Box } from '@mui/material'
import { SectionHeader } from '@/components/common/SectionHeader'
import { PhotoGalleryCard } from '@/components/media/PhotoGalleryCard'
import type { GalleryItem } from '@/types/homepage'

type PhotoGallerySectionProps = {
  items: GalleryItem[]
}

export function PhotoGallerySection({ items }: PhotoGallerySectionProps) {
  return (
    <Box component="section" aria-label="फोटो गैलरी">
      <SectionHeader title="फोटो गैलरी" eyebrow="तस्वीरों में खबर" href="/gallery" />
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
        }}
      >
        {items.map((item) => (
          <PhotoGalleryCard key={item.id} item={item} />
        ))}
      </Box>
    </Box>
  )
}
