import type { APIGatewayProxyHandler } from 'aws-lambda'
import { randomUUID } from 'node:crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { s3Client } from '../../shared/clients/s3.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { successResponse, errorResponse } from '../../shared/responses/apiResponse.js'

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif'])

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    const body = JSON.parse(event.body ?? '{}')

    const fileName = typeof body.fileName === 'string' ? body.fileName : 'image.jpg'

    const contentType =
      typeof body.contentType === 'string' ? body.contentType.toLowerCase() : 'image/jpeg'

    const uploadType = typeof body.uploadType === 'string' ? body.uploadType : 'article'

    const extension = fileName.split('.').pop()?.toLowerCase() ?? 'jpg'

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      throw new Error(
        'अमान्य फ़ाइल प्रकार। केवल JPG, PNG, WEBP और GIF फ़ाइलें अपलोड की जा सकती हैं।',
      )
    }

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      throw new Error(
        'अमान्य फ़ाइल एक्सटेंशन। केवल JPG, PNG, WEBP और GIF फ़ाइलें अपलोड की जा सकती हैं।',
      )
    }

    const bucket = getRequiredEnv('MEDIA_BUCKET_NAME')

    const folder = uploadType === 'advertisement' ? 'ads' : 'articles'

    const key = `${folder}/${Date.now()}-${randomUUID()}.${extension}`

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    })

    return successResponse(
      {
        uploadUrl,
        imageUrl: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        key,
      },
      requestId,
    )
  } catch (error) {
    return errorResponse(error, requestId)
  }
}
