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
      setError('दोनों पासवर्ड समान होने चाहिए।')
      return
    }

    try {
      setLoading(true)
      setError('')

      await completeNewPassword(password)

      navigate('/admin/articles', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'पासवर्ड अपडेट नहीं किया जा सका।')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
            नया पासवर्ड सेट करें
          </Typography>

          <Typography color="text.secondary" sx={{ mb: 3 }}>
            सुरक्षा कारणों से पहली बार लॉगिन करने पर नया पासवर्ड बनाना आवश्यक है।
          </Typography>

          <Stack component="form" spacing={2} onSubmit={handleSubmit}>
            <TextField
              label="नया पासवर्ड"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="नया पासवर्ड पुनः दर्ज करें"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
            />

            {error && <Typography color="error">{error}</Typography>}

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? 'पासवर्ड अपडेट किया जा रहा है...' : 'पासवर्ड अपडेट करें'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  )
}
