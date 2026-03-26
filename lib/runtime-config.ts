const localhostPattern = /^http:\/\/localhost(?::\d+)?$/i

type RuntimeEnv = Partial<Record<'NEXT_PUBLIC_APP_URL' | 'NEXTAUTH_URL' | 'VERCEL_URL' | 'NODE_ENV', string>>

function normalizeUrl(raw: string | undefined) {
  if (!raw) return null

  try {
    return new URL(raw).toString().replace(/\/$/, '')
  } catch {
    return null
  }
}

export function resolveAppBaseUrl(env: RuntimeEnv = process.env) {
  const isProduction = env.NODE_ENV === 'production'
  const publicUrl = normalizeUrl(env.NEXT_PUBLIC_APP_URL)
  const authUrl = normalizeUrl(env.NEXTAUTH_URL)
  const vercelUrl = env.VERCEL_URL ? normalizeUrl(`https://${env.VERCEL_URL}`) : null
  const explicitUrl = publicUrl || authUrl

  if (isProduction) {
    if (explicitUrl && !localhostPattern.test(explicitUrl)) {
      return explicitUrl
    }

    if (vercelUrl) {
      return vercelUrl
    }
  }

  return explicitUrl || vercelUrl || 'http://localhost:3000'
}

export function getMetadataBase() {
  return new URL(resolveAppBaseUrl())
}

export function sanitizeCallbackPath(callbackUrl: string | null | undefined) {
  if (!callbackUrl) return '/'
  if (!callbackUrl.startsWith('/')) return '/'
  if (callbackUrl.startsWith('//')) return '/'
  return callbackUrl
}
