import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testRuns, testRunResults } from '@/db/schema'
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

    return NextResponse.json({ data: testRun })
  } catch (error) {
    console.error('GET /api/test-runs/[id] failed:', error)
    return NextResponse.json({ error: 'Failed to fetch test run' }, { status: 500 })
  }
}
