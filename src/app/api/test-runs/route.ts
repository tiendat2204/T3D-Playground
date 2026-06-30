import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testRuns, testCases } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { generateId } from '@/lib/utils'
import { testRunQueue } from '@/worker/bullmq.config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')

  const conditions = []
  if (projectId) conditions.push(eq(testRuns.projectId, projectId))
  if (status) conditions.push(eq(testRuns.status, status as 'queued' | 'running' | 'passed' | 'failed' | 'cancelled'))

  const results = await db.query.testRuns.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(testRuns.createdAt)],
    with: {
      environment: true
    }
  })

  return NextResponse.json(results)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { projectId, environmentId, runType, tags, testCaseIds } = body

  let testCasesToRun = testCaseIds

  if (!testCasesToRun || testCasesToRun.length === 0) {
    const conditions = [eq(testCases.projectId, projectId), eq(testCases.status, 'approved')]

    if (tags && tags.length > 0) {
      const allCases = await db.query.testCases.findMany({
        where: and(...conditions)
      })
      testCasesToRun = allCases
        .filter(tc => tags.some(tag => tc.tags?.includes(tag)))
        .map(tc => tc.id)
    } else {
      const allCases = await db.query.testCases.findMany({
        where: and(...conditions)
      })
      testCasesToRun = allCases.map(tc => tc.id)
    }
  }

  const testRun = await db.insert(testRuns).values({
    id: generateId(),
    projectId,
    environmentId,
    runType: runType || 'manual',
    tags,
    summary: {
      total: testCasesToRun.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      error: 0
    }
  }).returning()

  await testRunQueue.add('run-tests', {
    testRunId: testRun[0].id,
    testCaseIds: testCasesToRun,
    environmentId
  })

  return NextResponse.json(testRun[0], { status: 201 })
}
