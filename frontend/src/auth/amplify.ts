import { Amplify } from 'aws-amplify'
import { env } from '@/config/env'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: env.cognitoUserPoolId,
      userPoolClientId: env.cognitoClientId,

      loginWith: {
        email: true,

        oauth: {
          domain: env.cognitoDomain,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [env.cognitoRedirectUri],
          redirectSignOut: [env.cognitoLogoutUri],
          responseType: 'code',
        },
      },
    },
  },
})
