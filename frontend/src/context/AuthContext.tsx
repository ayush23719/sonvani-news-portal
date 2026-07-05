import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { env } from '@/config/env'

type UserRole = 'ADMIN' | 'REPORTER' | 'PUBLIC'

type AuthUser = {
  username: string
  email?: string
  role: UserRole
  idToken: string
  accessToken: string
  refreshToken?: string
}

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  requiresNewPassword: boolean
  signIn: (username: string, password: string) => Promise<void>
  completeNewPassword: (password: string) => Promise<void>
  signUp: (
    username: string,
    email: string,
    password: string,
    role: UserRole,
  ) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const STORAGE_KEY = 'hindi-news-portal-auth'

function getUserPool() {
  if (!env.cognitoUserPoolId || !env.cognitoClientId) {
    throw new Error(
      'Cognito configuration is missing. Set VITE_COGNITO_USER_POOL_ID and VITE_COGNITO_CLIENT_ID.',
    )
  }

  return new CognitoUserPool({
    UserPoolId: env.cognitoUserPoolId,
    ClientId: env.cognitoClientId,
  })
}

function decodeJwtPayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1]

  if (!payload) {
    return {}
  }

  const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
  const paddedPayload = normalizedPayload.padEnd(
    normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
    '=',
  )

  return JSON.parse(window.atob(paddedPayload)) as Record<string, unknown>
}

function normalizeRole(value: unknown): UserRole {
  if (typeof value === 'string') {
    const normalized = value.toUpperCase()
    if (normalized === 'ADMIN' || normalized === 'REPORTER') {
      return normalized as UserRole
    }
  }

  return 'PUBLIC'
}

function resolveRole(claims: Record<string, unknown>): UserRole {
  const groups = claims['cognito:groups']

  if (Array.isArray(groups)) {
    const normalized = groups
      .filter((group): group is string => typeof group === 'string')
      .map((group) => group.toUpperCase())

    if (normalized.includes('ADMIN')) {
      return 'ADMIN'
    }

    if (normalized.includes('REPORTER')) {
      return 'REPORTER'
    }
  }

  const customRole = claims['custom:role']

  if (typeof customRole === 'string') {
    return normalizeRole(customRole)
  }

  return 'PUBLIC'
}
function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as AuthUser
    return parsed && parsed.idToken && parsed.accessToken ? parsed : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser())
  const [isLoading, setIsLoading] = useState(true)

  const [requiresNewPassword, setRequiresNewPassword] = useState(false)
  const [pendingCognitoUser, setPendingCognitoUser] = useState<CognitoUser | null>(null)

  useEffect(() => {
    const userPool = getUserPool()
    const cognitoUser = userPool.getCurrentUser()

    if (!cognitoUser) {
      window.localStorage.removeItem(STORAGE_KEY)
      setUser(null)
      setIsLoading(false)
      return
    }

    cognitoUser.getSession((err, session) => {
      if (err || !session?.isValid()) {
        cognitoUser.signOut()
        window.localStorage.removeItem(STORAGE_KEY)
        setUser(null)
        setIsLoading(false)
        return
      }

      const idToken = session.getIdToken().getJwtToken()
      const accessToken = session.getAccessToken().getJwtToken()
      const refreshToken = session.getRefreshToken()?.getToken()

      const claims = decodeJwtPayload(idToken)

      const nextUser: AuthUser = {
        username: cognitoUser.getUsername(),
        email: typeof claims.email === 'string' ? claims.email : undefined,
        role: resolveRole(claims),
        idToken,
        accessToken,
        refreshToken,
      }

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
      setUser(nextUser)
      setIsLoading(false)
    })
  }, [])

  const signIn = async (username: string, password: string) => {
    const userPool = getUserPool()
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    })
    const cognitoUser = new CognitoUser({
      Username: username,
      Pool: userPool,
    })

    await new Promise<void>((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          const idToken = result.getIdToken().getJwtToken()
          const accessToken = result.getAccessToken().getJwtToken()
          const refreshToken = result.getRefreshToken()?.getToken()
          const claims = decodeJwtPayload(idToken)
          const nextUser: AuthUser = {
            username,
            email: typeof claims.email === 'string' ? claims.email : undefined,
            role: resolveRole(claims),
            idToken,
            accessToken,
            refreshToken,
          }

          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
          setUser(nextUser)
          resolve()
        },
        onFailure: (error) => {
          console.error('Cognito login error:', error)
          reject(error)
        },
        newPasswordRequired: () => {
          setPendingCognitoUser(cognitoUser)
          setRequiresNewPassword(true)
          resolve()
        },
        mfaRequired: () => {
          reject(new Error('Multi-factor authentication is required.'))
        },
      })
    })
  }
  const completeNewPassword = async (password: string) => {
    if (!pendingCognitoUser) {
      throw new Error('No password change request found.')
    }

    await new Promise<void>((resolve, reject) => {
      pendingCognitoUser.completeNewPasswordChallenge(
        password,
        {},
        {
          onSuccess: (result) => {
            const idToken = result.getIdToken().getJwtToken()
            const accessToken = result.getAccessToken().getJwtToken()
            const refreshToken = result.getRefreshToken()?.getToken()

            const claims = decodeJwtPayload(idToken)

            const nextUser: AuthUser = {
              username: pendingCognitoUser.getUsername(),
              email: typeof claims.email === 'string' ? claims.email : undefined,
              role: resolveRole(claims),
              idToken,
              accessToken,
              refreshToken,
            }

            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))

            setUser(nextUser)
            setPendingCognitoUser(null)
            setRequiresNewPassword(false)

            resolve()
          },
          onFailure: reject,
        },
      )
    })
  }
  const signUp = async (
    username: string,
    email: string,
    password: string,
    role: UserRole,
  ) => {
    const userPool = getUserPool()
    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'custom:role', Value: role }),
    ]

    await new Promise<void>((resolve, reject) => {
      userPool.signUp(username, password, attributeList, [], (error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
  }

  const signOut = () => {
    const cachedUser = readStoredUser()
    if (cachedUser) {
      const cognitoUser = new CognitoUser({
        Username: cachedUser.username,
        Pool: getUserPool(),
      })
      cognitoUser.signOut()
    }

    window.localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      requiresNewPassword,
      signIn,
      completeNewPassword,
      signUp,
      signOut,
    }),
    [user, isLoading, requiresNewPassword, signIn, completeNewPassword, signUp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
