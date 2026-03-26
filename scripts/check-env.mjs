import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const cwd = process.cwd()
const envPath = path.join(cwd, '.env')
const args = new Set(process.argv.slice(2))
const strictMode = args.has('--strict')
const productionMode = args.has('--production') || process.env.NODE_ENV === 'production'

function isTrackedByGit(filePath) {
  try {
    const output = execSync(`git ls-files --error-unmatch ${filePath}`, {
      cwd,
      stdio: ['ignore', 'pipe', 'ignore'],
      encoding: 'utf8',
    })
    return output.trim().length > 0
  } catch {
    return false
  }
}

const requiredKeys = [
  'DATABASE_URL',
  'DIRECT_URL',
  'AUTH_SECRET',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'GEMINI_API_KEY',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'NEXT_PUBLIC_RAZORPAY_KEY_ID',
]

const riskyPatterns = [
  { label: 'tracked .env file present', test: () => isTrackedByGit('.env') },
  { label: 'AUTH_SECRET equals NEXTAUTH_SECRET', test: (env) => env.AUTH_SECRET && env.AUTH_SECRET === env.NEXTAUTH_SECRET },
  { label: 'placeholder or sample secret detected', test: (env) => Object.values(env).some((value) => /replace-with|your-|example|fallback-secret/i.test(String(value))) },
  { label: 'plain localhost callback URL', test: (env) => /^http:\/\/localhost:\d+$/i.test(env.NEXTAUTH_URL ?? '') },
  { label: 'plain localhost public app URL', test: (env) => /^http:\/\/localhost:\d+$/i.test(env.NEXT_PUBLIC_APP_URL ?? '') },
  { label: 'NEXTAUTH_URL and NEXT_PUBLIC_APP_URL do not match', test: (env) => Boolean(env.NEXTAUTH_URL && env.NEXT_PUBLIC_APP_URL && env.NEXTAUTH_URL !== env.NEXT_PUBLIC_APP_URL) },
]

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}

  const lines = fs.readFileSync(filePath, 'utf8').split('\n')
  const parsed = {}

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const match = trimmed.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!match) continue
    const [, key, rawValue] = match
    parsed[key] = rawValue.replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1')
  }

  return parsed
}

function mask(value) {
  if (!value) return 'missing'
  if (value.length <= 8) return 'present'
  return `${value.slice(0, 4)}...${value.slice(-4)}`
}

const fileEnv = parseEnvFile(envPath)
const mergedEnv = { ...fileEnv, ...process.env }

const missingKeys = requiredKeys.filter((key) => !mergedEnv[key])

console.log('Environment readiness report')
console.log('')

for (const key of requiredKeys) {
  console.log(`${key}: ${mask(mergedEnv[key])}`)
}

console.log('')

if (missingKeys.length > 0) {
  console.log(`Missing required keys: ${missingKeys.join(', ')}`)
} else {
  console.log('All required keys are present.')
}

const triggeredRisks = riskyPatterns.filter((risk) => risk.test(mergedEnv)).map((risk) => risk.label)

if (triggeredRisks.length > 0) {
  console.log('')
  console.log('Warnings:')
  for (const warning of triggeredRisks) {
    console.log(`- ${warning}`)
  }
}

if (strictMode) {
  const blockingWarnings = triggeredRisks.filter((warning) => {
    if (!productionMode) return warning !== 'tracked .env file present'
    return true
  })

  if (missingKeys.length > 0 || blockingWarnings.length > 0) {
    process.exitCode = 1
  }
}
