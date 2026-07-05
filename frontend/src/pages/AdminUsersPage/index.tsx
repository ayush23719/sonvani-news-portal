import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useState } from 'react'
import {
  createReporter,
  getUsers,
  disableUser,
  enableUser,
  deleteUser,
  setTemporaryPassword,
} from '@/services/adminUserService'

type User = {
  username: string
  name: string
  email: string
  enabled: boolean
  status: string
}

type Response = {
  success: boolean
  data: {
    users: User[]
  }
}
function getStatusLabel(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'सक्रिय'

    case 'FORCE_CHANGE_PASSWORD':
      return 'पहली बार लॉगिन शेष'

    case 'RESET_REQUIRED':
      return 'पासवर्ड रीसेट आवश्यक'

    case 'UNCONFIRMED':
      return 'पुष्टि लंबित'

    case 'ARCHIVED':
      return 'संग्रहित'

    case 'COMPROMISED':
      return 'सुरक्षा जोखिम'

    case 'UNKNOWN':
      return 'अज्ञात'

    default:
      return status
  }
}
export function AdminUsersPage() {
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: () => getUsers() as Promise<Response>,
  })

  const create = useMutation({
    mutationFn: createReporter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setOpen(false)
      setName('')
      setEmail('')
    },
  })
  const disable = useMutation({
    mutationFn: disableUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
  const enable = useMutation({
    mutationFn: enableUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
  const remove = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
  const tempPassword = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      setTemporaryPassword(username, password),
  })

  const users = data?.data.users ?? []

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          उपयोगकर्ता प्रबंधन
        </Typography>

        <Button variant="contained" onClick={() => setOpen(true)}>
          रिपोर्टर जोड़ें
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error">
          उपयोगकर्ता लोड नहीं हो सके।
          <Button onClick={() => refetch()}>पुनः प्रयास करें</Button>
        </Alert>
      )}

      {!isLoading && (
        <Card>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ईमेल</TableCell>

                  <TableCell>नाम</TableCell>

                  <TableCell>स्थिति</TableCell>

                  <TableCell>सक्रिय</TableCell>

                  <TableCell align="right">कार्रवाई</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{getStatusLabel(user.status)}</TableCell>
                    <TableCell>{user.enabled ? 'हाँ' : 'नहीं'}</TableCell>

                    <TableCell align="right">
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 2,
                        }}
                      >
                        {user.enabled ? (
                          <Button
                            size="small"
                            color="warning"
                            disabled={disable.isPending}
                            onClick={() => disable.mutate(user.username)}
                          >
                            अक्षम करें
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            color="success"
                            disabled={enable.isPending}
                            onClick={() => enable.mutate(user.username)}
                          >
                            सक्षम करें
                          </Button>
                        )}

                        <Button
                          size="small"
                          onClick={() => {
                            const password = prompt(
                              'अस्थायी पासवर्ड दर्ज करें',
                              'Temp@12345',
                            )

                            if (!password) return

                            tempPassword.mutate({
                              username: user.username,
                              password,
                            })
                          }}
                        >
                          अस्थायी पासवर्ड सेट करें
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          disabled={remove.isPending}
                          onClick={() => {
                            if (confirm(`क्या आप ${user.email} को हटाना चाहते हैं?`)) {
                              remove.mutate(user.username)
                            }
                          }}
                        >
                          हटाएँ
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>नया रिपोर्टर जोड़ें</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="नाम"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="ईमेल"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>रद्द करें</Button>

          <Button
            variant="contained"
            disabled={create.isPending}
            onClick={() =>
              create.mutate({
                name,
                email,
              })
            }
          >
            बनाएँ
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
