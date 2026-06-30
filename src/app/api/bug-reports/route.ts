import { NextResponse } from 'next/server'
import { db } from '@/db'
import { bugReports } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')

  const conditions = []
  if (projectId) conditions.push(eq(bugReports.projectId, projectId))
  if (status) conditions.push(eq(bugReports.status, status as 'open' | 'in-progress' | 'resolved' | 'closed'))

  const results = await db.query.bugReports.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(bugReports.createdAt)]
  })

  return NextResponse.json(results)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { projectId, testRunResultId, title, module, environment, stepsToReproduce, expectedResult, actualResult, evidence, aiAnalysis } = body

  const bugReport = await db.insert(bugReports).values({
    id: generateId(),
    projectId,
    testRunResultId,
    title,
    module,
    environment,
    stepsToReproduce,
    expectedResult,
    actualResult,
    evidence,
    aiAnalysis,
    updatedAt: new Date()
  }).returning()

  return NextResponse.json(bugReport[0], { status: 201 })
}
