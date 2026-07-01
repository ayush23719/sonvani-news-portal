import { Box, CircularProgress, Container, Typography } from '@mui/material'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

type RequireAuthProps = {
  children: React.ReactNode
  allowedRoles?: Array<'ADMIN' | 'REPORTER' | 'PUBLIC'>
}

export function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  // ===== TEMPORARY DEVELOPMENT BYPASS =====
  // Remove this block once Cognito is configured.
  if (import.meta.env.DEV) {
    return <>{children}</>
  }
  // =======================================

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, display: 'grid', placeItems: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            लॉगिन स्थिति जांची जा रही है...
          </Typography>
        </Box>
      </Container>
    )
  }

  if (!isAuthenticated) {
    const redirectTarget = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/login?redirect=${redirectTarget}`} replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Typography variant="h5">पहुँच अस्वीकृत</Typography>
        <Typography variant="body1" sx={{ mt: 1 }}>
          इस पृष्ठ तक आपकी अनुमति नहीं है।
        </Typography>
      </Container>
    )
  }

  return <>{children}</>
}
