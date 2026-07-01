import { NextResponse } from 'next/server'
import { getDefaultProvider, aiCache } from '@/services/ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, steps, expectedResult, baseUrl, environmentId } = body

    if (!title || !baseUrl) {
      return NextResponse.json({ error: 'title and baseUrl are required' }, { status: 400 })
    }

    const cacheKey = `code:${title}:${baseUrl}:${environmentId || 'default'}`
    const cached = await aiCache.get<string>(cacheKey)
    if (cached) {
      return NextResponse.json({ data: { code: cached } })
    }

    const provider = getDefaultProvider()
    const code = await provider.generatePlaywrightCode({
      testPlan: {
        summary: '',
        testSuites: [{
          name: '',
          priority: 'medium',
          tags: [],
          cases: [{
            title,
            steps: steps || [],
            expectedResult: expectedResult || '',
            risk: '',
            tags: []
          }]
        }]
      },
      testCase: {
        title,
        steps: steps || [],
        expectedResult: expectedResult || ''
      },
      baseUrl
    })

    await aiCache.set(cacheKey, code, 'codeGeneration')

    return NextResponse.json({ data: { code } })
  } catch (error) {
    console.error('POST /api/ai/generate-code failed:', error)
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
  }
}
