import { NextResponse } from 'next/server'
import { getDefaultProvider, aiCache } from '@/services/ai'
import { db } from '@/db'
import { testCases, modules } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { projectId, url, goal, role, destructiveAllowed } = body

    if (!projectId || !url || !goal) {
      return NextResponse.json({ error: 'projectId, url, and goal are required' }, { status: 400 })
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

    const projectModules = await db.query.modules.findMany({
      where: eq(modules.projectId, projectId)
    })

    for (const suite of testPlan.testSuites) {
      for (const testCase of suite.cases) {
        const matchingModule = projectModules.find(m =>
          testCase.tags.some(tag => tag.includes(m.name.toLowerCase()))
        )

        await db.insert(testCases).values({
          id: generateId(),
          projectId,
          moduleId: matchingModule?.id || null,
          title: testCase.title,
          description: testCase.steps.join('\n'),
          goal: testCase.expectedResult,
          tags: testCase.tags,
          priority: suite.priority,
          status: 'draft',
          createdByAi: true,
          updatedAt: new Date()
        })
      }
    }

    return NextResponse.json({ data: testPlan })
  } catch (error) {
    console.error('POST /api/ai/generate-plan failed:', error)
    return NextResponse.json({ error: 'Failed to generate test plan' }, { status: 500 })
  }
}
