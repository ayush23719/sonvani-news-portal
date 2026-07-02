import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import { useAuth } from '@/context/AuthContext'

export function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {user?.role === 'ADMIN' ? 'व्यवस्थापक डैशबोर्ड' : 'संवाददाता डैशबोर्ड'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          समाचार पोर्टल प्रबंधन प्रणाली में आपका स्वागत है।
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">भूमिका</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {user?.role === 'ADMIN'
                  ? 'व्यवस्थापक'
                  : user?.role === 'REPORTER'
                    ? 'संवाददाता'
                    : 'सार्वजनिक'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">स्थिति</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                सुरक्षित सत्र सक्रिय है।
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
