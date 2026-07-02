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
          Users
        </Typography>

        <Button variant="contained" onClick={() => setOpen(true)}>
          Add Reporter
        </Button>
      </Box>

      {isLoading && <CircularProgress />}

      {error && (
        <Alert severity="error">
          Failed to load users.
          <Button onClick={() => refetch()}>Retry</Button>
        </Alert>
      )}

      {!isLoading && (
        <Card>
          <CardContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Enabled</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.username}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.status}</TableCell>
                    <TableCell>{user.enabled ? 'Yes' : 'No'}</TableCell>

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
                            Disable
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            color="success"
                            disabled={enable.isPending}
                            onClick={() => enable.mutate(user.username)}
                          >
                            Enable
                          </Button>
                        )}

                        <Button
                          size="small"
                          onClick={() => {
                            const password = prompt('Temporary Password', 'Temp@12345')

                            if (!password) return

                            tempPassword.mutate({
                              username: user.username,
                              password,
                            })
                          }}
                        >
                          Set Temp Password
                        </Button>

                        <Button
                          size="small"
                          color="error"
                          disabled={remove.isPending}
                          onClick={() => {
                            if (confirm(`Delete ${user.email}?`)) {
                              remove.mutate(user.username)
                            }
                          }}
                        >
                          Delete
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
        <DialogTitle>Add Reporter</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>

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
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
