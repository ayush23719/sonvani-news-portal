import { Box, Container, Link, Paper, Stack, Typography } from '@mui/material'
import { useEffect } from 'react'

export function ContactPage() {
  useEffect(() => {
    document.title = 'संपर्क करें | सोनवाणी'
  }, [])

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 5 },
          border: 1,
          borderColor: 'divider',
        }}
      >
        <Stack spacing={4}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 800,
            }}
          >
            संपर्क करें
          </Typography>

          <Typography color="text.secondary">
            यदि आपके पास किसी समाचार से संबंधित जानकारी, सुझाव, शिकायत, तथ्यात्मक सुधार,
            विज्ञापन अथवा किसी अन्य विषय पर हमसे संपर्क करना चाहते हैं, तो नीचे दिए गए
            माध्यमों का उपयोग करें।
          </Typography>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>ईमेल</Typography>

            <Link
              href="mailto:sonevaninews@gmail.com"
              underline="hover"
              color="secondary"
            >
              sonevaninews@gmail.com
            </Link>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 700, mb: 1 }}>फोन</Typography>

            <Link href="tel:+919140931961" underline="hover" color="secondary">
              +91 9140931961
            </Link>
          </Box>

          <Typography color="text.secondary">
            हमारी टीम आपके संदेश का उत्तर यथाशीघ्र देने का प्रयास करेगी।
          </Typography>
        </Stack>
      </Paper>
    </Container>
  )
}
