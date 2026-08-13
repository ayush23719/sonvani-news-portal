import type { APIGatewayProxyHandler } from 'aws-lambda'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'

import { dynamoDbDocumentClient } from '../../shared/clients/dynamodb.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    const tableName = getRequiredEnv('ADVERTISEMENTS_TABLE_NAME')

    const result = await dynamoDbDocumentClient.send(
      new QueryCommand({
        TableName: tableName,
        IndexName: 'GSI_ByStatus',
        KeyConditionExpression: '#status = :status',
        ExpressionAttributeNames: {
          '#status': 'status',
        },
        ExpressionAttributeValues: {
          ':status': 'ACTIVE',
        },
        ScanIndexForward: false,
        Limit: 20,
      }),
    )

    return successResponse(
      {
        advertisements: result.Items ?? [],
      },
      requestId,
    )
  } catch (error) {
    return errorResponse(error, requestId)
  }
}
