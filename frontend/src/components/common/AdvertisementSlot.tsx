import { Box, Paper, Typography } from '@mui/material'

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
  const height = minHeight ?? (variant === 'banner' ? 96 : variant === 'sidebar' ? 280 : 220)

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'grid',
        width: '100%',
        maxWidth: '100%',
        minHeight: height,
        placeItems: 'center',
        border: 1,
        borderStyle: 'dashed',
        borderColor: 'divider',
        bgcolor: 'rgba(255,255,255,0.72)',
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 800 }}>
          {label}
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
          स्थान आरक्षित
        </Typography>
      </Box>
    </Paper>
  )
}
