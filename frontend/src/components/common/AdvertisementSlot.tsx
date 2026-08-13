import { Box, CircularProgress, Paper, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'

import { getAdvertisements } from '@/services/adminArticleService'

type AdvertisementSlotProps = {
  label?: string
  minHeight?: number
  variant?: 'banner' | 'box' | 'sidebar'
}

export function AdvertisementSlot({
  label = 'विज्ञापन',
  minHeight,
  variant = 'box',
}: AdvertisementSlotProps) {
  const height =
    minHeight ?? (variant === 'banner' ? 96 : variant === 'sidebar' ? 280 : 220)

  const { data, isLoading } = useQuery({
    queryKey: ['advertisements'],
    queryFn: getAdvertisements,
    staleTime: 60 * 1000,
  })

  const advertisement = data?.data?.advertisements?.[0]

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          display: 'grid',
          width: '100%',
          minHeight: height,
          placeItems: 'center',
          border: 1,
          borderStyle: 'dashed',
          borderColor: 'divider',
          bgcolor: 'rgba(255,255,255,0.72)',
        }}
      >
        <CircularProgress size={22} color="inherit" />
      </Paper>
    )
  }

  if (!advertisement) {
    return (
      <Paper
        elevation={0}
        sx={{
          display: 'grid',
          width: '100%',
          minHeight: height,
          placeItems: 'center',
          border: 1,
          borderStyle: 'dashed',
          borderColor: 'divider',
          bgcolor: 'rgba(255,255,255,0.72)',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '0.8rem',
              fontWeight: 800,
            }}
          >
            {label}
          </Typography>

          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '0.75rem',
            }}
          >
            स्थान आरक्षित
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        maxWidth: '100%',
        minHeight: height,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        component="img"
        src={advertisement.imageUrl}
        alt="विज्ञापन"
        sx={{
          display: 'block',
          width: '100%',
          height: '100%',
          minHeight: height,
          maxHeight: variant === 'sidebar' ? 400 : 500,
          objectFit: variant === 'banner' ? 'cover' : 'contain',
        }}
      />
    </Paper>
  )
}
