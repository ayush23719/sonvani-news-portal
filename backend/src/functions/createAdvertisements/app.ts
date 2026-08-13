import type { APIGatewayProxyHandler } from 'aws-lambda'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { randomUUID } from 'node:crypto'

import { dynamoDbDocumentClient } from '../../shared/clients/dynamodb.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { AppError } from '../../shared/errors/appError.js'
import { requireRole } from '../../shared/auth/cognito.js'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'

const ALLOWED_CONTENT_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    const user = requireRole(event, ['ADMIN', 'REPORTER'])

    const body = parseBody(event.body)

    const imageUrl = typeof body.imageUrl === 'string' ? body.imageUrl : ''

    const s3Key = typeof body.s3Key === 'string' ? body.s3Key : ''

    const fileName = typeof body.fileName === 'string' ? body.fileName : ''

    const contentType =
      typeof body.contentType === 'string' ? body.contentType.toLowerCase() : ''

    if (!imageUrl || !s3Key || !fileName || !contentType) {
      throw new AppError(
        'VALIDATION_ERROR',
        'विज्ञापन की सभी आवश्यक जानकारी देना अनिवार्य है।',
        400,
      )
    }

    if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
      throw new AppError(
        'VALIDATION_ERROR',
        'केवल JPG, PNG, WEBP और GIF विज्ञापन अपलोड किए जा सकते हैं।',
        400,
      )
    }

    if (!s3Key.startsWith('ads/')) {
      throw new AppError('VALIDATION_ERROR', 'अमान्य विज्ञापन फ़ाइल।', 400)
    }

    const advertisementId = randomUUID()
    const createdAt = new Date().toISOString()

    const advertisement = {
      pk: 'ADVERTISEMENT',
      sk: advertisementId,
      advertisementId,
      imageUrl,
      s3Key,
      fileName,
      contentType,
      status: 'ACTIVE',
      createdAt,
      createdBy: user.email ?? user.username,
    }

    const tableName = getRequiredEnv('ADVERTISEMENTS_TABLE_NAME')

    await dynamoDbDocumentClient.send(
      new PutCommand({
        TableName: tableName,
        Item: advertisement,
      }),
    )

    return successResponse(
      {
        advertisement,
      },
      requestId,
      201,
    )
  } catch (error) {
    return errorResponse(error, requestId)
  }
}

function parseBody(body: string | null | undefined): Record<string, unknown> {
  if (!body) {
    return {}
  }

  try {
    return JSON.parse(body) as Record<string, unknown>
  } catch {
    throw new AppError('VALIDATION_ERROR', 'Request body must be valid JSON.', 400)
  }
}
