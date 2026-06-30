import { Box, Button, Container, Stack } from '@mui/material'
import { PRIMARY_NAVIGATION_ITEMS } from '@/constants/navigation'

export function Navigation() {
  return (
    <Box
      component="nav"
      aria-label="मुख्य नेविगेशन"
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Container>
        <Stack
          direction="row"
          sx={{
            minWidth: 0,
            overflow: 'hidden',
            justifyContent: { md: 'space-between', xl: 'flex-start' },
          }}
        >
          {PRIMARY_NAVIGATION_ITEMS.map((item) => (
            <Button
              key={item.href}
              color="inherit"
              href={item.href}
              sx={{
                flexShrink: 1,
                minWidth: 0,
                minHeight: 48,
                px: { md: 0.9, lg: 1.35, xl: 2 },
                fontSize: { md: '0.86rem', lg: '0.95rem' },
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Container>
    </Box>
  )
}
