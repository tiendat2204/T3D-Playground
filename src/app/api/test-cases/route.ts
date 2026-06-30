import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testCases } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET(request: Request) {
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

  return NextResponse.json(results)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { projectId, moduleId, title, description, goal, tags, priority, generatedCode, createdByAi } = body

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

  return NextResponse.json(testCase[0], { status: 201 })
}
