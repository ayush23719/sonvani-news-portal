import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import { useAuth } from '@/context/AuthContext'

export function AdminDashboardPage() {
  const { user } = useAuth()

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {user?.role === 'ADMIN' ? 'Admin Dashboard' : 'Reporter Dashboard'}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Authentication and authorization foundation is now in place.
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Role</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {user?.role ?? 'PUBLIC'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6">Status</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Secure session is active.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Stack>
  )
}
