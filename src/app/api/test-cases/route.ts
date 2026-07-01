import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testCases } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ data: [], meta: { page: 1, limit: 0, total: 0, totalPages: 0 } })
  }

  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const moduleId = searchParams.get('moduleId')
    const status = searchParams.get('status')
    const tag = searchParams.get('tag')

    const conditions = []
    if (projectId) conditions.push(eq(testCases.projectId, projectId))
    if (moduleId) conditions.push(eq(testCases.moduleId, moduleId))
    if (status) conditions.push(eq(testCases.status, status as 'draft' | 'approved' | 'disabled'))

    let query = db.query.testCases.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(testCases.createdAt)],
      with: {
        module: true
      }
    })

    let results = await query

    if (tag) {
      results = results.filter(tc =>
        tc.tags?.includes(tag)
      )
    }

    return NextResponse.json({ data: results })
  } catch (error) {
    console.error('GET /api/test-cases failed:', error)
    return NextResponse.json({ error: 'Failed to fetch test cases' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { projectId, moduleId, title, description, goal, tags, priority, generatedCode, createdByAi } = body

    if (!projectId || !title) {
      return NextResponse.json({ error: 'projectId and title are required' }, { status: 400 })
    }

    const testCase = await db.insert(testCases).values({
      id: generateId(),
      projectId,
      moduleId,
      title,
      description,
      goal,
      tags,
      priority,
      generatedCode,
      createdByAi,
      updatedAt: new Date()
    }).returning()

    return NextResponse.json({ data: testCase[0] }, { status: 201 })
  } catch (error) {
    console.error('POST /api/test-cases failed:', error)
    return NextResponse.json({ error: 'Failed to create test case' }, { status: 500 })
  }
}
