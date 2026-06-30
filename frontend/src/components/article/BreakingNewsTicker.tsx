import { Box, Container, Typography } from '@mui/material'
import type { NewsItem } from '@/types/homepage'

type BreakingNewsTickerProps = {
  items: NewsItem[]
}

export function BreakingNewsTicker({ items }: BreakingNewsTickerProps) {
  return (
    <Box
      component="section"
      aria-label="ब्रेकिंग न्यूज़"
      sx={{
        borderBottom: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(104px, auto) minmax(0, 1fr)', md: '160px minmax(0, 1fr)' },
            minHeight: 44,
            overflow: 'hidden',
            maxWidth: '100%',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'secondary.main',
              color: 'secondary.contrastText',
              px: { xs: 1.25, md: 2 },
            }}
          >
            <Typography sx={{ fontSize: { xs: '0.85rem', md: '1rem' }, fontWeight: 900 }}>
              ब्रेकिंग न्यूज़
            </Typography>
          </Box>
          <Box sx={{ position: 'relative', minWidth: 0, overflow: 'hidden' }}>
            <Box
              sx={{
                display: 'inline-flex',
                width: 'max-content',
                gap: 4,
                py: 1.1,
                whiteSpace: 'nowrap',
                animation: 'ticker 28s linear infinite',
                '@keyframes ticker': {
                  from: { transform: 'translateX(0)' },
                  to: { transform: 'translateX(-50%)' },
                },
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                  overflowX: 'auto',
                },
              }}
            >
              {[...items, ...items].map((item, index) => (
                <Typography
                  key={`${item.id}-${index}`}
                  component="a"
                  href={item.href}
                  sx={{ color: 'text.primary', fontWeight: 800 }}
                >
                  {item.title}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
