import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite'
import { Box, Card, Typography } from '@mui/material'
import type { VideoItem } from '@/types/homepage'

type VideoCardProps = {
  item: VideoItem
}

export function VideoCard({ item }: VideoCardProps) {
  return (
    <Card
      component="article"
      elevation={0}
      sx={{
        overflow: 'hidden',
        borderRadius: 2,
      }}
    >
      <Box
        component="a"
        href={item.href}
        sx={{
          color: 'inherit',
          display: 'block',
          textDecoration: 'none',
        }}
      >
        <Box
          sx={{
            position: 'relative',
            aspectRatio: '16 / 9',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={`https://img.youtube.com/vi/${item.youtubeVideoId}/hqdefault.jpg`}
            alt={item.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: '0.3s',
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(0,0,0,.28)',
            }}
          />

          <PlayCircleFilledWhiteIcon
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%,-50%)',
              fontSize: 70,
              color: '#fff',
            }}
          />

          <Typography
            sx={{
              position: 'absolute',
              left: 10,
              top: 10,
              bgcolor: '#E53935',
              color: '#fff',
              px: 1,
              py: 0.35,
              borderRadius: 1,
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            VIDEO
          </Typography>

          <Typography
            sx={{
              position: 'absolute',
              right: 10,
              bottom: 10,
              bgcolor: 'rgba(0,0,0,.8)',
              color: '#fff',
              px: 1,
              py: 0.35,
              borderRadius: 1,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {item.duration}
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography
            component="h3"
            sx={{
              fontWeight: 800,
              fontSize: '1rem',
              lineHeight: 1.45,
            }}
          >
            {item.title}
          </Typography>
        </Box>
      </Box>
    </Card>
  )
}
