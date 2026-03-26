import { NextResponse } from 'next/server'

type JsonInit = ResponseInit & {
  headers?: HeadersInit
}

export function noStoreHeaders(headers?: HeadersInit) {
  const result = new Headers(headers)
  result.set('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate')
  result.set('Pragma', 'no-cache')
  result.set('Expires', '0')
  result.set('X-Content-Type-Options', 'nosniff')
  return result
}

export function jsonNoStore(body: unknown, init: JsonInit = {}) {
  return NextResponse.json(body, {
    ...init,
    headers: noStoreHeaders(init.headers),
  })
}

export function textNoStore(body: string, init: ResponseInit = {}) {
  return new Response(body, {
    ...init,
    headers: noStoreHeaders(init.headers),
  })
}
