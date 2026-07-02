import MenuIcon from '@mui/icons-material/Menu'
import {
  AppBar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Link as RouterLink, Outlet, useNavigate } from 'react-router-dom'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ArticleIcon from '@mui/icons-material/Article'
import AddCircleOutlinedIcon from '@mui/icons-material/AddCircleOutlined'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '@/context/AuthContext'

function getNavigationItems(role: 'ADMIN' | 'REPORTER' | 'PUBLIC') {
  if (role === 'ADMIN') {
    return [
      { label: 'डैशबोर्ड', href: '/admin', icon: <DashboardIcon /> },
      { label: 'समाचार', href: '/admin/articles', icon: <ArticleIcon /> },
      {
        label: 'नया समाचार',
        href: '/admin/articles/new',
        icon: <AddCircleOutlinedIcon />,
      },
      {
        label: 'उपयोगकर्ता',
        href: '/admin/users',
        icon: <PersonIcon />,
      },
      {
        label: 'प्रोफ़ाइल',
        href: '/admin/profile',
        icon: <PersonIcon />,
      },
    ]
  }

  return [
    { label: 'डैशबोर्ड', href: '/admin', icon: <DashboardIcon /> },
    { label: 'मेरे समाचार', href: '/admin/articles', icon: <ArticleIcon /> },
    {
      label: 'नया समाचार',
      href: '/admin/articles/new',
      icon: <AddCircleOutlinedIcon />,
    },
    {
      label: 'प्रोफ़ाइल',
      href: '/admin/profile',
      icon: <PersonIcon />,
    },
  ]
}

export function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const navigationItems = useMemo(
    () => getNavigationItems(user?.role ?? 'PUBLIC'),
    [user?.role],
  )

  const handleLogout = () => {
    signOut()
    navigate('/')
  }

  const drawerContent = (
    <Box
      sx={{ height: '100%', bgcolor: 'grey.50', borderRight: 1, borderColor: 'divider' }}
    >
      <Toolbar>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {user?.role === 'ADMIN' ? 'व्यवस्थापक डैशबोर्ड' : 'संवाददाता डैशबोर्ड'}
        </Typography>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {navigationItems.map((item) => (
          <ListItemButton
            key={item.href}
            component={RouterLink}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ px: 2, pb: 2, mt: 'auto' }}>
        <Button
          fullWidth
          variant="outlined"
          color="secondary"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          लॉगआउट
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: 'calc(100vh - 64px)',
        bgcolor: 'background.default',
      }}
    >
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{ display: { md: 'none' }, borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 700 }}>
            {user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Reporter Dashboard'}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { xs: 0, md: 280 }, flexShrink: 0 }}>
        <Box sx={{ display: { xs: 'none', md: 'block' }, height: '100%' }}>
          {drawerContent}
        </Box>
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, mt: { xs: 8, md: 0 } }}
      >
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  )
}
