import { NextResponse } from 'next/server'
import { getDefaultProvider, aiCache } from '@/services/ai'
import { db } from '@/db'
import { testCases, projects, environments } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { testCaseId, environmentId } = body

    if (!testCaseId || !environmentId) {
      return NextResponse.json({ error: 'testCaseId and environmentId are required' }, { status: 400 })
    }

    const testCase = await db.query.testCases.findFirst({
      where: eq(testCases.id, testCaseId)
    })

    if (!testCase) {
      return NextResponse.json({ error: 'Test case not found' }, { status: 404 })
    }

    const environment = await db.query.environments.findFirst({
      where: eq(environments.id, environmentId)
    })

    if (!environment) {
      return NextResponse.json({ error: 'Environment not found' }, { status: 404 })
    }

    const project = await db.query.projects.findFirst({
      where: eq(projects.id, testCase.projectId)
    })

    const cacheKey = `code:${testCaseId}:${environmentId}`
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
          priority: testCase.priority as 'high' | 'medium' | 'low',
          tags: testCase.tags || [],
          cases: [{
            title: testCase.title,
            steps: testCase.description?.split('\n') || [],
            expectedResult: testCase.goal || '',
            risk: '',
            tags: testCase.tags || []
          }]
        }]
      },
      testCase: {
        title: testCase.title,
        steps: testCase.description?.split('\n') || [],
        expectedResult: testCase.goal || ''
      },
      baseUrl: environment.baseUrl,
      authConfig: project?.authConfig as Record<string, unknown> | undefined
    })

    await aiCache.set(cacheKey, code, 'codeGeneration')

    await db.update(testCases).set({
      generatedCode: code,
      updatedAt: new Date()
    }).where(eq(testCases.id, testCaseId))

    return NextResponse.json({ data: { code } })
  } catch (error) {
    console.error('POST /api/ai/generate-code failed:', error)
    return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
  }
}
