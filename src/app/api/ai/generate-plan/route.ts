import { NextResponse } from 'next/server'
import { getDefaultProvider, aiCache } from '@/services/ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url, goal, role, destructiveAllowed } = body

    if (!url || !goal) {
      return NextResponse.json({ error: 'url and goal are required' }, { status: 400 })
    }

    const cacheKey = `plan:${url}:${goal}:${role || 'user'}`
    const cached = await aiCache.get(cacheKey)
    if (cached) {
      return NextResponse.json({ data: cached })
    }

    const provider = getDefaultProvider()
    const testPlan = await provider.generateTestPlan({
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
        error: 'AI API quota exceeded. Please wait a few minutes and try again, or upgrade your API plan.'
      }, { status: 429 })
    }

    return NextResponse.json({ error: 'Failed to generate test plan' }, { status: 500 })
  }
}
