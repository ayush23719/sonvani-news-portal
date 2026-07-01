import type { APIGatewayProxyHandler } from 'aws-lambda'
import {
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'

const cognito = new CognitoIdentityProviderClient({})

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    const username = event.pathParameters?.username?.trim()

    if (!username) {
      throw new Error('Username required')
    }

    const body = JSON.parse(event.body ?? '{}')

    await cognito.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: username,
        Password: body.password,
        Permanent: false,
      }),
    )

    return successResponse(
      {
        message: 'Temporary password set.',
      },
      requestId,
    )
  } catch (error) {
    return errorResponse(error, requestId)
  }
}
