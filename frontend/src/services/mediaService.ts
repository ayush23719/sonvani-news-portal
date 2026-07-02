import { env } from '@/config/env'

const api = env.apiBaseUrl.replace(/\/$/, '')

export async function uploadImage(file: File) {
  const auth = JSON.parse(localStorage.getItem('hindi-news-portal-auth')!)

  const token = auth.idToken

  console.log('1. Requesting upload URL...')

  const signedResponse = await fetch(`${api}/admin/media/upload-url`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileName: file.name,
      contentType: file.type,
    }),
  })

  console.log('2. Upload URL response:', signedResponse.status)

  const signed = await signedResponse.json()

  console.log('3. Signed payload:', signed)

  console.log('4. Uploading to S3...')

  const uploadResponse = await fetch(signed.data.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })

  console.log('5. S3 response:', uploadResponse.status)

  if (!uploadResponse.ok) {
    throw new Error('S3 upload failed')
  }

  console.log('6. Done')

  return signed.data.imageUrl
}
