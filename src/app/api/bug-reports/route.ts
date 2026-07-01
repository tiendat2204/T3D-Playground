import { NextResponse } from 'next/server'
import { db } from '@/db'
import { bugReports } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ data: [], meta: { page: 1, limit: 0, total: 0, totalPages: 0 } })
  }

  try {
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

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('GET /api/bug-reports failed:', error)
    return NextResponse.json({ error: 'Failed to fetch bug reports' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { projectId, testRunResultId, title, module, environment, stepsToReproduce, expectedResult, actualResult, evidence, aiAnalysis } = body

    if (!projectId || !title) {
      return NextResponse.json({ error: 'projectId and title are required' }, { status: 400 })
    }

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

    return NextResponse.json({ data: bugReport[0] }, { status: 201 })
  } catch (error) {
    console.error('POST /api/bug-reports failed:', error)
    return NextResponse.json({ error: 'Failed to create bug report' }, { status: 500 })
  }
}
