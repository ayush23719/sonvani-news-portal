import { Button, Container, Paper, Stack, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <Container sx={{ py: { xs: 4, md: 8 } }}>
      <Paper
        elevation={0}
        sx={{
          border: 1,
          borderColor: 'divider',
          p: { xs: 2.5, md: 4 },
        }}
      >
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Typography component="h1" variant="h1">
            पेज उपलब्ध नहीं है
          </Typography>
          <Typography color="text.secondary">
            जिस पेज को आप खोलना चाहते हैं, वह अभी उपलब्ध नहीं है।
          </Typography>
          <Button component={RouterLink} to="/" variant="contained">
            होम पर जाएं
          </Button>
        </Stack>
      </Paper>
    </Container>
  )
}
