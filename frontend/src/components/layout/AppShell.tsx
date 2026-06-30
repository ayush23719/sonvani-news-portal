import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'

export function AppShell() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: 12,
          top: 12,
          zIndex: 2000,
          transform: 'translateY(-160%)',
          borderRadius: 1,
          bgcolor: 'secondary.main',
          color: 'secondary.contrastText',
          px: 2,
          py: 1,
          fontWeight: 800,
          '&:focus': {
            transform: 'translateY(0)',
          },
        }}
      >
        मुख्य सामग्री पर जाएं
      </Box>
      <Header />
      <Box component="main" id="main-content">
        <Outlet />
      </Box>
      <Footer />
    </Box>
  )
}
