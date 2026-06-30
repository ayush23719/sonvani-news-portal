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
import { DISTRICT_NAVIGATION_ITEMS, PRIMARY_NAVIGATION_ITEMS } from '@/constants/navigation'
import { brandConfig } from '@/config/brand'

type MobileNavigationDrawerProps = {
  open: boolean
  onClose: () => void
}

export function MobileNavigationDrawer({ open, onClose }: MobileNavigationDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: 'min(92vw, 360px)',
            maxWidth: '100vw',
            overflowX: 'hidden',
          },
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: 'primary.main', fontSize: '1.45rem', fontWeight: 900 }}>
              {brandConfig.name}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: '0.82rem', overflowWrap: 'anywhere' }}>
              {brandConfig.tagline}
            </Typography>
          </Box>
          <IconButton aria-label="मेन्यू बंद करें" onClick={onClose} sx={{ flexShrink: 0, minHeight: 44, minWidth: 44 }}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ px: 2, py: 1.5 }}>
        <Button fullWidth startIcon={<LocationOnIcon />} variant="outlined">
          आपका शहर चुनें
        </Button>
      </Box>

      <List aria-label="मोबाइल नेविगेशन">
        {PRIMARY_NAVIGATION_ITEMS.map((item) => (
          <ListItemButton key={item.href} component="a" href={item.href} onClick={onClose} sx={{ minHeight: 48 }}>
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

      <Box sx={{ p: 2 }}>
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
