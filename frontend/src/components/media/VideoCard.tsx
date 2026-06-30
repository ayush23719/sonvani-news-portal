import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite'
import { Box, Card, Typography } from '@mui/material'
import type { VideoItem } from '@/types/homepage'

type VideoCardProps = {
  item: VideoItem
}

export function VideoCard({ item }: VideoCardProps) {
  return (
    <Card component="article" elevation={0} sx={{ overflow: 'hidden' }}>
      <Box component="a" href={item.href} sx={{ color: 'inherit', display: 'block' }}>
        <Box
          sx={{
            position: 'relative',
            display: 'grid',
            minHeight: 180,
            aspectRatio: '16 / 9',
            placeItems: 'center',
            background: 'linear-gradient(135deg, #07135F 0%, #111827 54%, #E5252A 100%)',
          }}
        >
          <PlayCircleFilledWhiteIcon sx={{ color: '#FFFFFF', fontSize: 58 }} />
          <Typography
            sx={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              borderRadius: 1,
              bgcolor: 'rgba(0,0,0,0.72)',
              color: '#FFFFFF',
              fontSize: '0.78rem',
              fontWeight: 800,
              px: 1,
              py: 0.4,
            }}
          >
            {item.duration}
          </Typography>
        </Box>
        <Box sx={{ p: 2 }}>
          <Typography component="h3" sx={{ fontSize: '1rem', fontWeight: 800, lineHeight: 1.45 }}>
            {item.title}
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}
