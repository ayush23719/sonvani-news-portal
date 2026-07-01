import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { useAuth } from '@/context/AuthContext'

export function AdminProfilePage() {
  const { user } = useAuth()

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Profile
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          Your current session details are shown below.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              Username
            </Typography>
            <Typography variant="body1">{user?.username ?? 'Not available'}</Typography>
            <Typography variant="body2" color="text.secondary">
              Role
            </Typography>
            <Typography variant="body1">{user?.role ?? 'PUBLIC'}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
