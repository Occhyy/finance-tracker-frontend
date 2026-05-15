import { createAuthClient } from '@neondatabase/neon-js/auth'
import { computed, shallowRef } from 'vue'

interface AuthUser {
  id: string
  email?: string
  name?: string | null
}

interface AuthSessionResult {
  data?: {
    session?: unknown
    user?: AuthUser
  } | null
  error?: {
    message?: string
  } | null
}

interface AuthTokenResult {
  data?: {
    token?: string
  } | null
  error?: {
    message?: string
  } | null
}

interface NeonAuthClient {
  getSession: () => Promise<AuthSessionResult>
  getJWTToken?: () => Promise<string | null>
  token?: () => Promise<AuthTokenResult>
  signOut: () => Promise<unknown>
  signIn: {
    email: (input: { email: string; password: string }) => Promise<AuthSessionResult>
    social: (input: { provider: 'google'; callbackURL?: string }) => Promise<AuthSessionResult>
  }
  signUp: {
    email: (input: { name: string; email: string; password: string }) => Promise<AuthSessionResult>
  }
}

let authClient: NeonAuthClient | null = null

export const authUser = shallowRef<AuthUser | null>(null)
export const authReady = shallowRef(false)
export const isAuthenticated = computed(() => Boolean(authUser.value))

function requireAuthClient(): NeonAuthClient {
  if (!authClient) {
    throw new Error('Authentication is not ready')
  }

  return authClient
}

function assertAuthResult(result: AuthSessionResult): void {
  if (result.error) {
    throw new Error(result.error.message ?? 'Authentication failed')
  }
}

export async function initAuth(baseUrl: string): Promise<void> {
  authClient = createAuthClient(baseUrl) as unknown as NeonAuthClient
  await refreshSession()
  authReady.value = true
}

export function initLocalAuth(): void {
  authClient = null
  authUser.value = {
    id: 'local-dev',
    email: 'local-dev@example.test',
    name: 'Local development',
  }
  authReady.value = true
}

export async function refreshSession(): Promise<void> {
  const result = await requireAuthClient().getSession()
  assertAuthResult(result)
  authUser.value = result.data?.user ?? null
}

export async function signInWithEmail(email: string, password: string): Promise<void> {
  const result = await requireAuthClient().signIn.email({ email, password })
  assertAuthResult(result)
  await refreshSession()
}

export async function signUpWithEmail(email: string, password: string): Promise<void> {
  const name = email.split('@')[0] || 'User'
  const result = await requireAuthClient().signUp.email({ name, email, password })
  assertAuthResult(result)
  await refreshSession()
}

export async function signInWithGoogle(): Promise<void> {
  const result = await requireAuthClient().signIn.social({
    provider: 'google',
    callbackURL: window.location.origin,
  })
  assertAuthResult(result)
}

export async function signOut(): Promise<void> {
  if (authClient) {
    await authClient.signOut()
  }
  authUser.value = null
}

export async function getJwtToken(): Promise<string | null> {
  if (!authClient || !authUser.value) {
    return null
  }

  if (authClient.getJWTToken) {
    const token = await authClient.getJWTToken()
    if (!token) {
      throw new Error('Could not refresh authentication')
    }

    return token
  }

  if (authClient.token) {
    const result = await authClient.token()
    if (result.error) {
      throw new Error(result.error.message ?? 'Could not refresh authentication')
    }

    return result.data?.token ?? null
  }

  throw new Error('Authentication token support is not available')
}
