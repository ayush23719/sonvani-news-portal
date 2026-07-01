import type { APIGatewayProxyHandler } from 'aws-lambda'
import {
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { errorResponse, successResponse } from '../../shared/responses/apiResponse.js'

const cognito = new CognitoIdentityProviderClient({})

export const handler: APIGatewayProxyHandler = async (event) => {
  const requestId = event.requestContext.requestId

  try {
    const body = JSON.parse(event.body ?? '{}')

    const email = body.email?.trim()
    const name = body.name?.trim()

    if (!email || !name) {
      throw new Error('Name and email are required.')
    }

    const userPoolId = process.env.COGNITO_USER_POOL_ID!

    await cognito.send(
      new AdminCreateUserCommand({
        UserPoolId: userPoolId,
        Username: email,
        UserAttributes: [
          {
            Name: 'email',
            Value: email,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
          {
            Name: 'name',
            Value: name,
          },
        ],
        DesiredDeliveryMediums: ['EMAIL'],
      }),
    )

    await cognito.send(
      new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: email,
        GroupName: 'REPORTER',
      }),
    )

    return successResponse(
      {
        message: 'Reporter created successfully.',
      },
      requestId,
    )
  } catch (error) {
    return errorResponse(error, requestId)
  }
}
