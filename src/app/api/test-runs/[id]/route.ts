import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testRuns, testRunResults } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const testRun = await db.query.testRuns.findFirst({
    where: eq(testRuns.id, id),
    with: {
      environment: true,
      results: {
        with: {
          testCase: true
        }
      }
    }
  })

  if (!testRun) {
    return NextResponse.json({ error: 'Test run not found' }, { status: 404 })
  }

  return NextResponse.json(testRun)
}
