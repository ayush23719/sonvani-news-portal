import { Box, Card, CardContent, Stack, Typography } from '@mui/material'
import { useAuth } from '@/context/AuthContext'

export function AdminProfilePage() {
  const { user } = useAuth()
  console.log(user)
  console.log(user?.name)
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          आपका प्रोफ़ाइल
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
          आपका उपयोगकर्ता नाम और भूमिका नीचे दी गई है। यदि आपको अपनी भूमिका बदलने की
          आवश्यकता है, तो कृपया व्यवस्थापक से संपर्क करें।
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Typography variant="body2" color="text.secondary">
              नाम
            </Typography>
            <Typography variant="body1">{user?.name ?? 'Not available'}</Typography>
            <Typography variant="body2" color="text.secondary">
              भूमिका
            </Typography>
            <Typography variant="body1">{user?.role ?? 'PUBLIC'}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  )
}
