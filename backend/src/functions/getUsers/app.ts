import type { APIGatewayProxyHandler } from 'aws-lambda'
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { successResponse, errorResponse } from '../../shared/responses/apiResponse.js'

const cognito = new CognitoIdentityProviderClient({})

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    const command = new ListUsersCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID!,
    })

    const result = await cognito.send(command)

    const users =
      result.Users?.map((user) => ({
        username: user.Username,
        name: user.Attributes?.find((a) => a.Name === 'name')?.Value ?? '',
        enabled: user.Enabled,
        status: user.UserStatus,
        email: user.Attributes?.find((a) => a.Name === 'email')?.Value ?? '',
      })) ?? []

    return successResponse({ users }, requestId)
  } catch (error) {
    return errorResponse(error, requestId)
  }
}
