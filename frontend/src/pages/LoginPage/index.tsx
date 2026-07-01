import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { signIn, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectTarget =
    new URLSearchParams(location.search).get('redirect') ?? '/admin/articles'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTarget, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTarget])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      await signIn(username, password)
      navigate(redirectTarget, { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed.'
      setError(message)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 } }}>
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                लॉगिन
              </Typography>
              <Typography variant="body2" color="text.secondary">
                एडीट और प्रकाशन के लिए अपने खाते से प्रवेश करें।
              </Typography>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: 'grid', gap: 2 }}
            >
              <TextField
                label="यूज़रनेम"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="पासवर्ड"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                fullWidth
              />
              {error ? (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              ) : null}
              <Button type="submit" variant="contained" color="secondary">
                लॉगिन
              </Button>
            </Box>

            <Typography variant="body2" color="text.secondary">
              अभी खाता नहीं है?{' '}
              <Typography variant="body2" color="text.secondary">
                यदि आपके पास खाता नहीं है, तो व्यवस्थापक से संपर्क करें।
              </Typography>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
