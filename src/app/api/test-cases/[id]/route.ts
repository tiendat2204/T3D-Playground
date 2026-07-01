import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testCases } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    const { id } = await params
    const testCase = await db.query.testCases.findFirst({
      where: eq(testCases.id, id),
      with: {
        module: true,
        suggestions: true
      }
    })

    if (!testCase) {
      return NextResponse.json({ error: 'Test case not found' }, { status: 404 })
    }

    return NextResponse.json({ data: testCase })
  } catch (error) {
    console.error('GET /api/test-cases/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to fetch test case' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    const updated = await db.update(testCases).set({
      ...body,
      updatedAt: new Date()
    }).where(eq(testCases.id, id)).returning()

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Test case not found' }, { status: 404 })
    }

    return NextResponse.json({ data: updated[0] })
  } catch (error) {
    console.error('PUT /api/test-cases/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to update test case' }, { status: 500 })
  }
}
