import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  Table,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useTheme, useMediaQuery, Divider } from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { TableContainer } from '@mui/material'
import Chip from '@mui/material/Chip'
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
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  return (
    <Stack spacing={3}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
          justifyContent: 'space-between',
          alignItems: {
            xs: 'stretch',
            sm: 'center',
          },
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: {
              xs: '1.2rem',
              sm: '1.5rem',
              md: '2rem',
            },
          }}
        >
          उपयोगकर्ता प्रबंधन
        </Typography>

        <Button
          variant="contained"
          disabled={create.isPending}
          onClick={() => setOpen(true)}
          sx={{
            alignSelf: {
              xs: 'flex-start',
              sm: 'auto',
            },
          }}
        >
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

      {!isLoading &&
        (isMobile ? (
          <Stack spacing={2}>
            {users.map((user) => (
              <Card key={user.username}>
                <CardContent>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {user.name}
                      </Typography>

                      <Typography color="text.secondary">{user.email}</Typography>
                    </Box>

                    <Divider />

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        स्थिति
                      </Typography>

                      <Typography>{getStatusLabel(user.status)}</Typography>
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        सक्रिय
                      </Typography>

                      <Box sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          color={user.enabled ? 'success' : 'default'}
                          label={user.enabled ? 'हाँ' : 'नहीं'}
                        />
                      </Box>
                    </Box>

                    <Divider />

                    <Stack spacing={1}>
                      {user.enabled ? (
                        <Button
                          variant="outlined"
                          color="warning"
                          onClick={() => disable.mutate(user.username)}
                        >
                          अक्षम करें
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="success"
                          onClick={() => enable.mutate(user.username)}
                        >
                          सक्षम करें
                        </Button>
                      )}

                      <Button
                        variant="outlined"
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
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          if (confirm(`क्या आप ${user.email} को हटाना चाहते हैं?`)) {
                            remove.mutate(user.username)
                          }
                        }}
                      >
                        हटाएँ
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        ) : (
          <Card>
            <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
              <TableContainer
                sx={{
                  overflowX: 'auto',
                }}
              >
                <Table
                  size="small"
                  sx={{
                    minWidth: {
                      xs: 500,
                      sm: 700,
                    },
                  }}
                >
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
                        <TableCell
                          sx={{
                            maxWidth: 220,
                            wordBreak: 'break-word',
                          }}
                        >
                          {user.email}
                        </TableCell>
                        <TableCell
                          sx={{
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {user.name}
                        </TableCell>
                        <TableCell>{getStatusLabel(user.status)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={user.enabled ? 'success' : 'default'}
                            label={user.enabled ? 'हाँ' : 'नहीं'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: {
                                xs: 'column',
                                sm: 'row',
                              },
                              alignItems: {
                                xs: 'stretch',
                                sm: 'center',
                              },
                              justifyContent: 'flex-end',
                              gap: 1,
                              minWidth: {
                                xs: 140,
                                sm: 'auto',
                              },
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
                                if (
                                  confirm(`क्या आप ${user.email} को हटाना चाहते हैं?`)
                                ) {
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
              </TableContainer>
            </CardContent>
          </Card>
        ))}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>नया रिपोर्टर जोड़ें</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="नाम"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />

            <TextField
              fullWidth
              required
              type="email"
              label="ईमेल"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={Boolean(email) && !/\S+@\S+\.\S+/.test(email)}
              helperText={
                Boolean(email) && !/\S+@\S+\.\S+/.test(email) ? 'सही ईमेल दर्ज करें' : ''
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>रद्द करें</Button>

          <Button
            variant="contained"
            disabled={
              create.isPending ||
              !name.trim() ||
              !email.trim() ||
              !/\S+@\S+\.\S+/.test(email)
            }
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
