import type { APIGatewayProxyHandler } from 'aws-lambda'
import { randomUUID } from 'node:crypto'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { s3Client } from '../../shared/clients/s3.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { successResponse, errorResponse } from '../../shared/responses/apiResponse.js'

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    const body = JSON.parse(event.body ?? '{}')

    const extension = body.fileName?.split('.').pop()?.toLowerCase() ?? 'jpg'

    const key = `articles/${Date.now()}-${randomUUID()}.${extension}`

    const bucket = getRequiredEnv('MEDIA_BUCKET_NAME')

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: body.contentType,
    })

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 300,
    })

    return successResponse(
      {
        uploadUrl,
        imageUrl: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
      },
      requestId,
    )
  } catch (error) {
    return errorResponse(error, event.requestContext.requestId)
  }
}
