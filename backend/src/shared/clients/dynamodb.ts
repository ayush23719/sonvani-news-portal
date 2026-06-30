import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb'
import { getAwsRegion, getOptionalEnv } from '../env/environment.js'

export const dynamoDbClient = new DynamoDBClient({
  region: getAwsRegion(),
  endpoint: getOptionalEnv('AWS_ENDPOINT_URL'),
})

export const dynamoDbDocumentClient = DynamoDBDocumentClient.from(dynamoDbClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: true,
  },
})
