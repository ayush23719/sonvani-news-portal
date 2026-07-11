import FacebookIcon from '@mui/icons-material/Facebook'
import InstagramIcon from '@mui/icons-material/Instagram'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import YouTubeIcon from '@mui/icons-material/YouTube'
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import { brandConfig } from '@/config/brand'
import { Link as RouterLink } from 'react-router-dom'
const footerGroups = [
  {
    title: 'समाचार',
    links: [
      { label: 'ताज़ा खबरें', href: '/categories/latest/articles' },
      { label: 'राज्य', href: '/states/उत्तर-प्रदेश/articles' },
      { label: 'देश', href: '/categories/desh/articles' },
      { label: 'क्राइम', href: '/categories/crime/articles' },
    ],
  },
  {
    title: 'सोनवाणी',
    links: [
      { label: 'हमारे बारे में', href: '/about' },
      { label: 'संपर्क करें', href: '/contact' },
      { label: 'संपादकीय नीति', href: '/editorial-policy' },
      { label: 'विज्ञापन', href: '/contact' },
    ],
  },
  {
    title: 'कानूनी',
    links: [
      { label: 'गोपनीयता नीति', href: '/privacy-policy' },
      { label: 'नियम और शर्तें', href: '/terms' },
      { label: 'डिस्क्लेमर', href: '/disclaimer' },
    ],
  },
]

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        mt: { xs: 5, md: 7 },
        overflowX: 'hidden',
      }}
    >
      <Container sx={{ py: { xs: 4, md: 5 } }}>
        <Box
          sx={{
            display: 'grid',
            gap: { xs: 3, md: 4 },
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
              lg: '1.4fr repeat(3, 1fr)',
            },
          }}
        >
          <Stack spacing={2} sx={{ minWidth: 0 }}>
            <Box
              component="img"
              src={brandConfig.logoPath}
              alt={`${brandConfig.name} लोगो`}
              sx={{
                width: { xs: 164, sm: 184 },
                aspectRatio: '224 / 72',
                borderRadius: 1,
              }}
            />
            <Typography
              sx={{
                maxWidth: 380,
                color: 'rgba(255,255,255,0.82)',
                overflowWrap: 'anywhere',
              }}
            >
              {brandConfig.tagline}. स्थानीय खबरों से लेकर देश-दुनिया तक, साफ और भरोसेमंद
              हिंदी समाचार।
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                aria-label="फेसबुक"
                rel="noopener noreferrer"
                href={brandConfig.socialLinks.facebook}
                target="_blank"
                sx={{ color: 'white' }}
              >
                <FacebookIcon />
              </IconButton>
              <IconButton
                aria-label="यूट्यूब"
                target="_blank"
                rel="noopener noreferrer"
                href={brandConfig.socialLinks.youtube}
                sx={{ color: 'white' }}
              >
                <YouTubeIcon />
              </IconButton>
              <IconButton
                aria-label="इंस्टाग्राम"
                rel="noopener noreferrer"
                target="_blank"
                href={brandConfig.socialLinks.instagram}
                sx={{ color: 'white' }}
              >
                <InstagramIcon />
              </IconButton>
              <IconButton
                aria-label="व्हाट्सऐप"
                target="_blank"
                rel="noopener noreferrer"
                href={brandConfig.socialLinks.whatsapp}
                sx={{ color: 'white' }}
              >
                <WhatsAppIcon />
              </IconButton>
            </Stack>
          </Stack>

          {footerGroups.map((group) => (
            <Box key={group.title} sx={{ minWidth: 0 }}>
              <Typography sx={{ mb: 1.5, fontWeight: 900 }}>{group.title}</Typography>
              <Stack spacing={0.5} sx={{ alignItems: 'flex-start' }}>
                {group.links.map((link) => (
                  <Button
                    key={link.label}
                    component={RouterLink}
                    to={link.href}
                    color="inherit"
                    size="small"
                    sx={{
                      minHeight: 40,
                      px: 0,
                      color: 'rgba(255,255,255,0.76)',
                      whiteSpace: 'normal',
                      textAlign: 'left',
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
              </Stack>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.16)' }} />
        <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: '0.875rem' }}>
          © 2026 {brandConfig.name}. सर्वाधिकार सुरक्षित.
        </Typography>
      </Container>
    </Box>
  )
}
