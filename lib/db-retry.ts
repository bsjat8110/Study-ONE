function isRetryablePrismaConnectionError(error: unknown): boolean {
  if (!(error instanceof Error)) return false

  const name = error.name ?? ''
  const message = error.message ?? ''

  return (
    name === 'PrismaClientInitializationError' &&
    (
      message.includes("Can't reach database server") ||
      message.includes('Timed out fetching a new connection') ||
      message.includes('Connection terminated unexpectedly')
    )
  )
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function withDbRetry<T>(
  operation: () => Promise<T>,
  {
    retries = 2,
    delayMs = 600,
  }: {
    retries?: number
    delayMs?: number
  } = {}
): Promise<T> {
  let attempt = 0

  while (true) {
    try {
      return await operation()
    } catch (error) {
      if (!isRetryablePrismaConnectionError(error) || attempt >= retries) {
        throw error
      }

      attempt += 1
      await wait(delayMs * attempt)
    }
  }
}
