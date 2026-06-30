import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testCases } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  return NextResponse.json(testCase)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updated = await db.update(testCases).set({
    ...body,
    updatedAt: new Date()
  }).where(eq(testCases.id, id)).returning()

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Test case not found' }, { status: 404 })
  }

  return NextResponse.json(updated[0])
}
