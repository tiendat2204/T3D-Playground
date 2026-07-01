import { NextResponse } from 'next/server'
import { getDefaultProvider, getAIProvider, aiCache } from '@/services/ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, goal, role, destructiveAllowed, apiKey, provider, model } = body

    if (!url || !goal) {
      return NextResponse.json({ error: 'url and goal are required' }, { status: 400 })
    }

    const cacheKey = `plan:${url}:${goal}:${role || 'user'}:${provider || 'default'}`
    const cached = await aiCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ data: cached })
    }

    // Set API key in environment for the provider to use
    if (apiKey && provider === 'gemini') {
      process.env.GOOGLE_GENERATIVE_AI_API_KEY = apiKey
    } else if (apiKey && provider === 'openai') {
      process.env.OPENAI_API_KEY = apiKey
    }

    let aiProvider
    if (provider) {
      aiProvider = getAIProvider({ type: provider, model })
    } else {
      aiProvider = getDefaultProvider()
    }

    const testPlan = await aiProvider.generateTestPlan({
      url,
      goal,
      role,
      destructiveAllowed
    })

    await aiCache.set(cacheKey, testPlan, 'testPlan')

    return NextResponse.json({ data: testPlan })
  } catch (error: unknown) {
    console.error('POST /api/ai/generate-plan failed:', error)

    const errorMessage = error instanceof Error ? error.message : String(error)
    const isQuotaError = errorMessage.includes('quota') || errorMessage.includes('429')

    if (isQuotaError) {
      return NextResponse.json({
        error: 'AI API quota exceeded. Please wait a few minutes and try again, or switch to a different provider in Settings.'
      }, { status: 429 })
    }

    return NextResponse.json({ error: 'Failed to generate test plan' }, { status: 500 })
  }
}
