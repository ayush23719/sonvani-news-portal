import MenuIcon from '@mui/icons-material/Menu'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import SearchIcon from '@mui/icons-material/Search'
import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Toolbar,
} from '@mui/material'
import { useState } from 'react'
import { MobileNavigationDrawer } from '@/components/navigation/MobileNavigationDrawer'
import { Navigation } from '@/components/navigation/Navigation'
import { brandConfig } from '@/config/brand'
import { Link as RouterLink } from 'react-router-dom'
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <AppBar
        color="inherit"
        elevation={0}
        position="sticky"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          overflowX: 'hidden',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Container>
          <Toolbar
            disableGutters
            sx={{ minHeight: { xs: 60, sm: 68, md: 78 }, gap: { xs: 1, sm: 1.5, lg: 2 } }}
          >
            <Box component="a" href="/" sx={{ display: 'inline-flex', minWidth: 0 }}>
              <Box
                component="img"
                src={brandConfig.logoPath}
                alt={`${brandConfig.name} लोगो`}
                sx={{
                  width: { xs: 132, sm: 178, md: 212 },
                  aspectRatio: '224 / 72',
                  height: 'auto',
                }}
              />
            </Box>

            <Stack
              direction="row"
              spacing={1.5}
              sx={{
                display: { xs: 'none', lg: 'flex' },
                ml: 'auto',
                alignItems: 'center',
              }}
            >
              <Button
                color="inherit"
                startIcon={<LocationOnIcon sx={{ color: 'secondary.main' }} />}
              >
                आपका शहर
              </Button>
              <Paper
                component="form"
                elevation={0}
                sx={{
                  display: 'flex',
                  width: 280,
                  border: 1,
                  borderColor: 'divider',
                  alignItems: 'center',
                  px: 1.25,
                }}
              >
                <InputBase
                  fullWidth
                  inputProps={{ 'aria-label': 'खबर खोजें' }}
                  placeholder="यहां लिखें"
                  sx={{ fontSize: '0.92rem' }}
                />
                <SearchIcon sx={{ color: 'text.secondary' }} />
              </Paper>
              <Stack direction="row" spacing={1}>
                <Button color="secondary" variant="contained">
                  लाइव
                </Button>

                <Button
                  component={RouterLink}
                  to="/cms"
                  variant="outlined"
                  color="secondary"
                >
                  CMS Login
                </Button>
              </Stack>
            </Stack>

            <Box sx={{ flexGrow: { xs: 1, lg: 0 } }} />

            <IconButton
              aria-label="खोजें"
              sx={{
                display: { xs: 'inline-flex', lg: 'none' },
                minWidth: 44,
                minHeight: 44,
              }}
            >
              <SearchIcon />
            </IconButton>
            <IconButton
              aria-label={isMobileMenuOpen ? 'मेन्यू बंद करें' : 'मेन्यू खोलें'}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              sx={{
                display: { xs: 'inline-flex', lg: 'none' },
                minWidth: 44,
                minHeight: 44,
              }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
        <Navigation />
      </AppBar>
      <MobileNavigationDrawer
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  )
}
