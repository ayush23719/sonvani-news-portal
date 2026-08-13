import { useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ImageIcon from '@mui/icons-material/Image'
import RefreshIcon from '@mui/icons-material/Refresh'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  createAdvertisement,
  deleteAdvertisement,
  getAdvertisements,
  uploadAdvertisementFile,
} from '@/services/adminArticleService'

const MAX_FILE_SIZE = 10 * 1024 * 1024

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function AdminAdvertisementsPage() {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const queryClient = useQueryClient()

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [errorMessage, setErrorMessage] = useState('')

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['advertisements'],
    queryFn: getAdvertisements,
  })

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const uploaded = await uploadAdvertisementFile(file)

      return createAdvertisement({
        imageUrl: uploaded.imageUrl,
        s3Key: uploaded.key,
        fileName: file.name,
        contentType: file.type,
      })
    },
    onSuccess: () => {
      setSelectedFile(null)
      setErrorMessage('')

      if (inputRef.current) {
        inputRef.current.value = ''
      }

      void queryClient.invalidateQueries({
        queryKey: ['advertisements'],
      })
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error ? error.message : 'विज्ञापन अपलोड नहीं हो सका।',
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAdvertisement,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['advertisements'],
      })
    },
    onError: (error) => {
      setErrorMessage(
        error instanceof Error ? error.message : 'विज्ञापन हटाया नहीं जा सका।',
      )
    },
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setErrorMessage('')

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setSelectedFile(null)
      setErrorMessage('केवल JPG, PNG, WEBP और GIF फ़ाइलें अपलोड की जा सकती हैं।')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null)
      setErrorMessage('विज्ञापन का आकार अधिकतम 10 MB होना चाहिए।')
      return
    }

    setSelectedFile(file)
  }

  const handleUpload = () => {
    if (!selectedFile) {
      setErrorMessage('कृपया पहले विज्ञापन फ़ाइल चुनें।')
      return
    }

    uploadMutation.mutate(selectedFile)
  }

  const advertisements = data?.data?.advertisements ?? []

  return (
    <Stack spacing={{ xs: 2.5, md: 3 }}>
      <Box>
        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: {
              xs: '1.5rem',
              sm: '1.8rem',
              md: '2.1rem',
            },
          }}
        >
          विज्ञापन प्रबंधन
        </Typography>

        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          वेबसाइट पर प्रदर्शित होने वाले विज्ञापन यहां से अपलोड करें।
        </Typography>
      </Box>

      {errorMessage && (
        <Alert severity="error" onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              नया विज्ञापन अपलोड करें
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              JPG, PNG, WEBP या GIF फ़ाइल चुनें। अधिकतम आकार 10 MB है।
            </Typography>
          </Box>

          <input
            ref={inputRef}
            type="file"
            hidden
            accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
          />

          <Button
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
            sx={{
              alignSelf: {
                xs: 'stretch',
                sm: 'flex-start',
              },
            }}
          >
            विज्ञापन चुनें
          </Button>

          {selectedFile && (
            <Card
              variant="outlined"
              sx={{
                overflow: 'hidden',
                maxWidth: 650,
              }}
            >
              <CardContent>
                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={2}
                  sx={{
                    alignItems: {
                      xs: 'stretch',
                      sm: 'center',
                    },
                  }}
                >
                  <ImageIcon
                    sx={{
                      fontSize: 42,
                      color: 'primary.main',
                    }}
                  />

                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {selectedFile.name}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </Typography>
                  </Box>

                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={uploadMutation.isPending}
                    startIcon={
                      uploadMutation.isPending ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <CloudUploadIcon />
                      )
                    }
                  >
                    {uploadMutation.isPending ? 'अपलोड हो रहा है...' : 'अपलोड करें'}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Stack>
      </Paper>

      <Divider />

      <Box>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            mb: 2,
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              मौजूदा विज्ञापन
            </Typography>

            <Typography variant="body2" color="text.secondary">
              वेबसाइट पर वर्तमान में सक्रिय विज्ञापन।
            </Typography>
          </Box>

          <IconButton
            onClick={() => void refetch()}
            disabled={isFetching}
            aria-label="विज्ञापन रीफ़्रेश करें"
          >
            <RefreshIcon />
          </IconButton>
        </Stack>

        {isLoading ? (
          <Box
            sx={{
              minHeight: 200,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : advertisements.length === 0 ? (
          <Paper
            elevation={0}
            sx={{
              minHeight: 200,
              display: 'grid',
              placeItems: 'center',
              p: 3,
              border: 1,
              borderStyle: 'dashed',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Stack
              spacing={1}
              sx={{
                alignItems: 'center',
              }}
            >
              <ImageIcon
                sx={{
                  fontSize: 48,
                  color: 'text.disabled',
                }}
              />

              <Typography sx={{ fontWeight: 700 }}>
                अभी कोई विज्ञापन उपलब्ध नहीं है।
              </Typography>

              <Typography variant="body2" color="text.secondary">
                ऊपर से पहला विज्ञापन अपलोड करें।
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <Grid container spacing={2}>
            {advertisements.map((advertisement) => (
              <Grid
                key={advertisement.advertisementId}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'grey.100',
                      minHeight: {
                        xs: 180,
                        sm: 220,
                      },
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={advertisement.imageUrl}
                      alt="विज्ञापन"
                      sx={{
                        width: '100%',
                        height: '100%',
                        maxHeight: 280,
                        objectFit: 'contain',
                      }}
                    />
                  </Box>

                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        wordBreak: 'break-word',
                      }}
                    >
                      {advertisement.fileName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      अपलोड:{' '}
                      {new Date(advertisement.createdAt).toLocaleDateString('hi-IN')}
                    </Typography>
                  </CardContent>

                  <Box sx={{ px: 2, pb: 2 }}>
                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      startIcon={<DeleteIcon />}
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        const confirmed = window.confirm(
                          'क्या आप इस विज्ञापन को हटाना चाहते हैं?',
                        )

                        if (confirmed) {
                          deleteMutation.mutate(advertisement.advertisementId)
                        }
                      }}
                    >
                      विज्ञापन हटाएँ
                    </Button>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Stack>
  )
}
