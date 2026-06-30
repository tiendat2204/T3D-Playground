import { NextResponse } from 'next/server'
import { getDefaultProvider, aiCache } from '@/services/ai'
import { db } from '@/db'
import { testCases, modules } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function POST(request: Request) {
  const body = await request.json()
  const { projectId, url, goal, role, destructiveAllowed } = body

  const cacheKey = `plan:${url}:${goal}:${role || 'user'}`
  const cached = await aiCache.get(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
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

  return NextResponse.json(testPlan)
}
