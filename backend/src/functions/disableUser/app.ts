import type { APIGatewayProxyHandler } from 'aws-lambda'
import {
  AdminDisableUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'

const cognito = new CognitoIdentityProviderClient({})

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    const username = event.pathParameters?.username?.trim()

    if (!username) {
      throw new Error('Username is required.')
    }

    await cognito.send(
      new AdminDisableUserCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID!,
        Username: username,
      }),
    )

    return successResponse(
      {
        message: 'User disabled successfully.',
      },
      requestId,
    )
  } catch (error) {
    return errorResponse(error, requestId)
  }
}
