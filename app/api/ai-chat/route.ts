import { NextRequest, NextResponse } from 'next/server'
import { requireStudent, isNextResponse } from '@/lib/auth-utils'
import prisma from '@/lib/prisma'

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview'
const DAILY_TOKEN_LIMIT = 100000

function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  return apiKey
}

const SYSTEM_PROMPT = `You are Study-ONE Enterprise AI Tutor — a premium, high-performance academic mentor for students preparing for elite competitive exams (JEE, NEET, CBSE, etc.).

Core Directives:
- Mathematical Precision: Use LaTeX-style formatting or clear Unicode for all equations.
- Pedagogical Excellence: Break down complex topics into "Enterprise Modules" — Intuition, Theory, and Application.
- Encouragement & Discipline: Be supportive but maintain a professional, elite academic tone.
- Context Awareness: If asked about the platform, explain that Study-ONE is a next-gen learning ecosystem with real-time analytics.
- Format: Always use structured markdown (bolding, lists) for readability.
- Engagement: End every response with a "Pro-Tip" or a challenging "Quick Check" question.`

export async function POST(req: NextRequest) {
  try {
    const user = await requireStudent()
    if (isNextResponse(user)) return user

    // 1. Fetch user usage and check limit
    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { dailyTokensUsed: true, lastTokenReset: true }
    })

    if (!fullUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const now = new Date()
    const lastReset = new Date(fullUser.lastTokenReset)
    const isNewDay = now.toDateString() !== lastReset.toDateString()

    let dailyTokens = isNewDay ? 0 : fullUser.dailyTokensUsed

    if (dailyTokens >= DAILY_TOKEN_LIMIT) {
      return NextResponse.json({ 
        error: 'DAILY_LIMIT_REACHED', 
        message: 'You have reached your daily limit of 100k tokens. Please try again tomorrow.' 
      }, { status: 429 })
    }

    const { messages, lang } = await req.json()
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array is required' }, { status: 400 })
    }

    // Award points for AI engagement
    const { awardPoints } = await import('@/lib/gamification')
    await awardPoints(user.id, 'AI_CHAT_ASK')

    const geminiApiKey = getGeminiApiKey()

    // Build Gemini contents array from chat history
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const langHint = lang === 'hi' 
      ? "IMPORTANT: User preferred language is Hindi. Respond primarily in Hindi (using Devanagari script)." 
      : "IMPORTANT: User preferred language is English. Respond primarily in English."

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent?alt=sse&key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: `${SYSTEM_PROMPT}\n\n${langHint}` }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      }
    )

    if (!response.ok) {
      const err = await response.text()
      console.error('Gemini API error:', err)
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 })
    }

    // Stream the SSE response back to client
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader()
        const decoder = new TextDecoder()
        let totalChunkTokens = 0

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const lines = chunk.split('\n')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim()
                if (dataStr === '[DONE]') continue
                try {
                  const parsed = JSON.parse(dataStr)
                  
                  // Extract text
                  const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
                  }

                  // Extract usage metadata if present (usually in the last chunk)
                  if (parsed.usageMetadata) {
                    totalChunkTokens = parsed.usageMetadata.totalTokenCount
                  }
                } catch {
                  // skip malformed chunks
                }
              }
            }
          }

          // Update tokens in DB after stream finishes
          if (totalChunkTokens > 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                dailyTokensUsed: dailyTokens + totalChunkTokens,
                lastTokenReset: now
              }
            })
          }
        } catch (err) {
          console.error('Streaming error:', err)
        } finally {
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
          reader.releaseLock()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('AI chat error:', error)
    const message = error instanceof Error && error.message === 'GEMINI_API_KEY is not configured'
      ? 'AI service is not configured'
      : 'Internal server error'
    const status = message === 'AI service is not configured' ? 503 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
