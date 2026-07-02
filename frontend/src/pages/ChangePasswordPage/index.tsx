import {
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ChangePasswordPage() {
  const navigate = useNavigate()
  const { completeNewPassword } = useAuth()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setLoading(true)
      setError('')

      await completeNewPassword(password)

      navigate('/admin/articles', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
            Set New Password
          </Typography>

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
            />

            {error && <Typography color="error">{error}</Typography>}

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
