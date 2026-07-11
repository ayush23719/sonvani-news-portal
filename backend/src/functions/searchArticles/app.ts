import type { APIGatewayProxyHandler } from 'aws-lambda'
import { ScanCommand } from '@aws-sdk/lib-dynamodb'
import { dynamoDbDocumentClient } from '../../shared/clients/dynamodb.js'
import { getRequiredEnv } from '../../shared/env/environment.js'
import { successResponse, errorResponse } from '../../shared/responses/apiResponse.js'
import { validateRequiredEnvironment } from '../../shared/validation/environment.js'

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    validateRequiredEnvironment()

    const query = event.queryStringParameters?.q?.trim()

    if (!query) {
      return successResponse(
        {
          items: [],
          pagination: {
            limit: 0,
            nextCursor: null,
            hasMore: false,
          },
        },
        requestId,
      )
    }

    const lower = query.toLowerCase()

    const result = await dynamoDbDocumentClient.send(
      new ScanCommand({
        TableName: getRequiredEnv('ARTICLES_TABLE_NAME'),
      }),
    )

    const items = (result.Items ?? [])
      .filter((item: any) => item.status === 'PUBLISHED')
      .filter((item: any) => {
        const title = item.title?.toLowerCase() ?? ''
        const summary = item.summary?.toLowerCase() ?? ''
        const body = item.body?.toLowerCase() ?? ''

        return title.includes(lower) || summary.includes(lower) || body.includes(lower)
      })
      .sort(
        (a: any, b: any) =>
          new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
      )

    return successResponse(
      {
        items,
        pagination: {
          limit: items.length,
          nextCursor: null,
          hasMore: false,
        },
      },
      requestId,
    )
  } catch (err) {
    return errorResponse(err, requestId)
  }
}
