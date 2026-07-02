import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { Box, Card, Chip, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { NewsImage } from '@/components/common/NewsImage'
import type { NewsItem } from '@/types/homepage'

type ArticleCardProps = {
  item: NewsItem
  variant?: 'standard' | 'hero' | 'horizontal' | 'compact'
}

export function ArticleCard({ item, variant = 'standard' }: ArticleCardProps) {
  const isHero = variant === 'hero'
  const isHorizontal = variant === 'horizontal'
  const isCompact = variant === 'compact'

  return (
    <Card
      component="article"
      elevation={0}
      sx={{
        height: '100%',
        minWidth: 0,
        overflow: 'hidden',
        transition:
          'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': {
          borderColor: 'rgba(229,37,42,0.35)',
          boxShadow: { md: '0 14px 30px rgba(17,24,39,0.12)' },
          transform: { md: 'translateY(-2px)' },
          '& .news-card-title': {
            color: 'secondary.main',
          },
        },
      }}
    >
      <Box
        component={RouterLink}
        to={item.href}
        sx={{
          display: isHorizontal ? 'grid' : 'block',
          gridTemplateColumns: {
            xs: isHorizontal ? '96px minmax(0, 1fr)' : undefined,
            sm: isHorizontal ? '140px minmax(0, 1fr)' : undefined,
            md: isHorizontal ? '152px minmax(0, 1fr)' : undefined,
          },
          height: '100%',
          color: 'inherit',
          minWidth: 0,
          textDecoration: 'none',
        }}
      >
        <NewsImage
          label={item.imageLabel}
          imageUrl={item.imageUrl}
          tone={item.imageTone}
          aspectRatio={isHorizontal ? '1 / 1' : isHero ? '16 / 10' : '16 / 9'}
          minHeight={
            isHorizontal
              ? { xs: 96, sm: 128, md: 136 }
              : isHero
                ? { xs: 188, sm: 248, md: 300 }
                : { xs: 150, sm: 160 }
          }
        />
        <Box
          sx={{
            minWidth: 0,
            p: isHero
              ? { xs: 1.75, sm: 2, md: 2.5 }
              : isCompact
                ? 1.5
                : { xs: 1.6, sm: 2 },
          }}
        >
          <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
            <Chip
              color={item.isBreaking ? 'secondary' : 'primary'}
              label={item.category}
              size="small"
              sx={{ borderRadius: 1, fontWeight: 800 }}
            />
            {item.isFeatured ? (
              <Chip
                label="प्रमुख"
                size="small"
                sx={{ borderRadius: 1, fontWeight: 800 }}
              />
            ) : null}
          </Stack>
          <Typography
            className="news-card-title"
            component={isHero ? 'h1' : 'h3'}
            sx={{
              color: 'text.primary',
              fontSize: isHero
                ? { xs: '1.35rem', sm: '1.65rem', md: '2.2rem' }
                : isCompact
                  ? { xs: '0.95rem', sm: '1rem' }
                  : { xs: '1.05rem', md: '1.18rem' },
              fontWeight: 800,
              lineHeight: 1.35,
              overflowWrap: 'anywhere',
              transition: 'color 180ms ease',
            }}
          >
            {item.title}
          </Typography>
          {!isCompact ? (
            <Typography
              color="text.secondary"
              sx={{
                display: { xs: isHero ? 'block' : 'none', sm: 'block' },
                mt: 1,
                lineHeight: 1.65,
                overflowWrap: 'anywhere',
              }}
            >
              {item.summary}
            </Typography>
          ) : null}
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              mt: 1.5,
              color: 'text.secondary',
              flexWrap: 'wrap',
              fontSize: '0.8rem',
              rowGap: 0.75,
            }}
          >
            {item.district ? (
              <Box sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}>
                <LocationOnIcon sx={{ color: 'secondary.main', fontSize: 17 }} />
                <span>{item.district}</span>
              </Box>
            ) : null}
            <Box sx={{ display: 'inline-flex', gap: 0.5, alignItems: 'center' }}>
              <AccessTimeIcon sx={{ fontSize: 16 }} />
              <span>{item.publishedAt}</span>
            </Box>
          </Stack>
        </Box>
      </Box>
    </Card>
  )
}
