import CloseIcon from '@mui/icons-material/Close'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect } from 'react'
import {
  DISTRICT_NAVIGATION_ITEMS,
  PRIMARY_NAVIGATION_ITEMS,
} from '@/constants/navigation'
import { brandConfig } from '@/config/brand'

type MobileNavigationDrawerProps = {
  open: boolean
  onClose: () => void
}

export function MobileNavigationDrawer({ open, onClose }: MobileNavigationDrawerProps) {
  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    if (open) {
      html.style.overflow = 'hidden'
      body.style.overflow = 'hidden'

      html.style.touchAction = 'none'
      body.style.touchAction = 'none'

      body.style.position = 'fixed'
      body.style.width = '100%'
    } else {
      html.style.overflow = ''
      body.style.overflow = ''

      html.style.touchAction = ''
      body.style.touchAction = ''

      body.style.position = ''
      body.style.width = ''
    }

    return () => {
      html.style.overflow = ''
      body.style.overflow = ''

      html.style.touchAction = ''
      body.style.touchAction = ''

      body.style.position = ''
      body.style.width = ''
    }
  }, [open])
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
        disableScrollLock: false,
      }}
      slotProps={{
        paper: {
          sx: {
            width: 'min(92vw, 360px)',
            maxWidth: '100vw',
            overflowX: 'hidden',
            top: 0,
            height: '100%',
            zIndex: (theme) => theme.zIndex.drawer + 2,
          },
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack
          direction="row"
          sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{ color: 'primary.main', fontSize: '1.45rem', fontWeight: 900 }}
            >
              {brandConfig.name}
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ fontSize: '0.82rem', overflowWrap: 'anywhere' }}
            >
              {brandConfig.tagline}
            </Typography>
          </Box>
          <IconButton
            aria-label="मेन्यू बंद करें"
            onClick={onClose}
            sx={{ flexShrink: 0, minHeight: 44, minWidth: 44 }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ px: 2, py: 1.5 }}>
        <Button fullWidth startIcon={<LocationOnIcon />} variant="outlined">
          आपका शहर चुनें
        </Button>
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <Button fullWidth variant="contained" color="secondary" onClick={onClose}>
            लाइव
          </Button>

          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            href="/cms"
            onClick={onClose}
          >
            CMS Login
          </Button>
        </Stack>
      </Box>

      <List aria-label="मोबाइल नेविगेशन">
        {PRIMARY_NAVIGATION_ITEMS.map((item) => (
          <ListItemButton
            key={item.href}
            component="a"
            href={item.href}
            onClick={onClose}
            sx={{ minHeight: 48 }}
          >
            <ListItemText
              primary={
                <Typography component="span" sx={{ fontWeight: 800 }}>
                  {item.label}
                </Typography>
              }
            />
          </ListItemButton>
        ))}
      </List>

      <Divider />

      <Box
        sx={{
          p: 2,
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
        }}
      >
        <Typography sx={{ mb: 1, fontWeight: 900 }}>ज़िले की खबरें</Typography>
        <Stack spacing={1}>
          {DISTRICT_NAVIGATION_ITEMS.map((item) => (
            <Button
              key={item.href}
              href={item.href}
              color="inherit"
              onClick={onClose}
              sx={{ justifyContent: 'start', minHeight: 44 }}
            >
              {item.label}
            </Button>
          ))}
        </Stack>
      </Box>
    </Drawer>
  )
}
