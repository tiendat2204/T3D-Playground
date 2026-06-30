import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testRuns } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const testRun = await db.query.testRuns.findFirst({
    where: eq(testRuns.id, id)
  })

  if (!testRun) {
    return NextResponse.json({ error: 'Test run not found' }, { status: 404 })
  }

  if (testRun.status !== 'queued' && testRun.status !== 'running') {
    return NextResponse.json({ error: 'Cannot cancel completed test run' }, { status: 400 })
  }

  const updated = await db.update(testRuns).set({
    status: 'cancelled',
    finishedAt: new Date()
  }).where(eq(testRuns.id, id)).returning()

  return NextResponse.json(updated[0])
}
