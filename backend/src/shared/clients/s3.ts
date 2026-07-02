import { S3Client } from '@aws-sdk/client-s3'
import { getAwsRegion, getOptionalEnv } from '../env/environment.js'

export const s3Client = new S3Client({
  region: getAwsRegion(),
  endpoint: getOptionalEnv('AWS_ENDPOINT_URL'),
})
