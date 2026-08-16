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
  const placeholderHeight =
    minHeight ?? (variant === 'banner' ? 96 : variant === 'sidebar' ? 280 : 220)
  const maxImageHeight =
    variant === 'sidebar' ? { xs: 520, md: 640 } : { xs: 420, sm: 520, md: 640 }

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
          minHeight: placeholderHeight,
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
          minHeight: placeholderHeight,
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
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
        p: { xs: 1, sm: 1.5 },
        bgcolor: 'grey.100',
        border: 1,
        borderColor: 'divider',
      }}
    >
      <Box
        component="img"
        src={advertisement.imageUrl}
        alt="विज्ञापन"
        sx={{
          display: 'block',
          width: 'auto',
          height: 'auto',
          maxWidth: '100%',
          maxHeight: maxImageHeight,
          objectFit: 'contain',
        }}
      />
    </Paper>
  )
}
