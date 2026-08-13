import type { APIGatewayProxyHandler } from 'aws-lambda'
import { DeleteCommand } from '@aws-sdk/lib-dynamodb'
import { DeleteObjectCommand } from '@aws-sdk/client-s3'

import { dynamoDbDocumentClient } from '../../shared/clients/dynamodb.js'
import { s3Client } from '../../shared/clients/s3.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { AppError } from '../../shared/errors/appError.js'
import { requireRole } from '../../shared/auth/cognito.js'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    requireRole(event, ['ADMIN', 'REPORTER'])

    const advertisementId = event.pathParameters?.advertisementId

    if (!advertisementId) {
      throw new AppError('VALIDATION_ERROR', 'विज्ञापन आईडी आवश्यक है।', 400)
    }

    const tableName = getRequiredEnv('ADVERTISEMENTS_TABLE_NAME')
    const bucket = getRequiredEnv('MEDIA_BUCKET_NAME')

    const deleteResult = await dynamoDbDocumentClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: {
          pk: 'ADVERTISEMENT',
          sk: advertisementId,
        },
        ReturnValues: 'ALL_OLD',
      }),
    )

    const oldAdvertisement = deleteResult.Attributes

    if (!oldAdvertisement) {
      throw new AppError('VALIDATION_ERROR', 'विज्ञापन नहीं मिला।', 404)
    }

    if (typeof oldAdvertisement.s3Key === 'string') {
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: oldAdvertisement.s3Key,
        }),
      )
    }

    return successResponse(
      {
        deleted: true,
        advertisementId,
      },
      requestId,
    )
  } catch (error) {
    return errorResponse(error, requestId)
  }
}
