import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testCases } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const updated = await db.update(testCases).set({
    status: 'disabled',
    updatedAt: new Date()
  }).where(eq(testCases.id, id)).returning()

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Test case not found' }, { status: 404 })
  }

  return NextResponse.json(updated[0])
}
