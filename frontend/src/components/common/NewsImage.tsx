import { Box, Typography } from '@mui/material'
import type { NewsItem } from '@/types/homepage'

type ResponsiveCssValue =
  string | number | Partial<Record<'xs' | 'sm' | 'md' | 'lg' | 'xl', string | number>>

type NewsImageProps = {
  label: string

  imageUrl?: string

  tone?: NewsItem['imageTone']

  aspectRatio?: ResponsiveCssValue

  minHeight?: ResponsiveCssValue
}
const toneGradients: Record<NewsItem['imageTone'], string> = {
  red: 'linear-gradient(135deg, #5B0B11 0%, #E5252A 52%, #F59E0B 100%)',
  navy: 'linear-gradient(135deg, #07135F 0%, #1D4ED8 54%, #0F172A 100%)',
  green: 'linear-gradient(135deg, #064E3B 0%, #128C4A 58%, #8ABF3C 100%)',
  amber: 'linear-gradient(135deg, #78350F 0%, #F59E0B 58%, #E5252A 100%)',
  slate: 'linear-gradient(135deg, #111827 0%, #475569 55%, #94A3B8 100%)',
}

export function NewsImage({
  label,
  imageUrl,
  tone = 'navy',
  aspectRatio = '16 / 9',
  minHeight = 160,
}: NewsImageProps) {
  return (
    <Box
      aria-label={label}
      role="img"
      sx={{
        position: 'relative',
        display: 'grid',
        width: '100%',
        maxWidth: '100%',
        minHeight,
        aspectRatio,
        overflow: 'hidden',
        placeItems: 'end start',
        bgcolor: 'primary.main',
      }}
    >
      {imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt={label}
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        <>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: toneGradients[tone],
            }}
          />

          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'radial-gradient(circle at 78% 18%, rgba(255,255,255,0.28), transparent 28%), linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.62) 100%)',
            }}
          />
        </>
      )}

      <Typography
        sx={{
          position: 'relative',
          m: 1.5,
          borderRadius: 1,
          bgcolor: 'rgba(255,255,255,0.94)',
          color: 'primary.main',
          fontSize: '0.78rem',
          fontWeight: 800,
          maxWidth: 'calc(100% - 24px)',
          overflowWrap: 'anywhere',
          px: 1,
          py: 0.4,
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}
