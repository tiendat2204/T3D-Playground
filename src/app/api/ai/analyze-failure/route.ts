import { NextResponse } from 'next/server'
import { getDefaultProvider } from '@/services/ai'
import { db } from '@/db'
import { testRunResults, testCases } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  const body = await request.json()
  const { testRunResultId } = body

  const result = await db.query.testRunResults.findFirst({
    where: eq(testRunResults.id, testRunResultId)
  })

  if (!result) {
    return NextResponse.json({ error: 'Test run result not found' }, { status: 404 })
  }

  const testCase = await db.query.testCases.findFirst({
    where: eq(testCases.id, result.testCaseId)
  })

  const provider = getDefaultProvider()
  const analysis = await provider.analyzeFailure({
    testCode: testCase?.generatedCode || '',
    errorMessage: result.errorMessage || '',
    consoleLogs: (result.consoleLogs as string[]) || [],
    currentUrl: undefined,
    failedStep: undefined
  })

  await db.update(testRunResults).set({
    aiAnalysis: {
      rootCause: analysis.rootCause,
      confidenceScore: analysis.confidenceScore,
      issueType: analysis.issueType,
      suggestedFix: analysis.suggestedFix
    }
  }).where(eq(testRunResults.id, testRunResultId))

  return NextResponse.json(analysis)
}
