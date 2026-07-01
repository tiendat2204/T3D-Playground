import { NextResponse } from 'next/server'
import { getDefaultProvider } from '@/services/ai'
import { db } from '@/db'
import { testRunResults, testCases, testRuns, bugReports } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Database is not configured' }, { status: 503 })
  }

  try {
    const body = await request.json()
    const { testRunResultId } = body

    if (!testRunResultId) {
      return NextResponse.json({ error: 'testRunResultId is required' }, { status: 400 })
    }

    const result = await db.query.testRunResults.findFirst({
      where: eq(testRunResults.id, testRunResultId)
    })

    if (!result) {
      return NextResponse.json({ error: 'Test run result not found' }, { status: 404 })
    }

    const testCase = await db.query.testCases.findFirst({
      where: eq(testCases.id, result.testCaseId)
    })

    const testRun = await db.query.testRuns.findFirst({
      where: eq(testRuns.id, result.testRunId)
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

    if (analysis.bugReport && testRun) {
      const existingBugReport = await db.query.bugReports.findFirst({
        where: eq(bugReports.testRunResultId, testRunResultId)
      })

      if (!existingBugReport) {
        await db.insert(bugReports).values({
          id: generateId(),
          projectId: testRun.projectId,
          testRunResultId,
          title: analysis.bugReport.title,
          stepsToReproduce: analysis.bugReport.stepsToReproduce,
          expectedResult: analysis.bugReport.expectedResult,
          actualResult: analysis.bugReport.actualResult,
          evidence: {
            consoleLogs: result.consoleLogs as string[] | undefined,
            screenshotUrl: result.screenshotUrl || undefined,
            videoUrl: result.videoUrl || undefined,
            traceUrl: result.traceUrl || undefined
          },
          aiAnalysis: analysis.bugReport.aiAnalysis,
          status: 'open',
          updatedAt: new Date()
        })
      }
    }

    return NextResponse.json({ data: analysis })
  } catch (error) {
    console.error('POST /api/ai/analyze-failure failed:', error)
    return NextResponse.json({ error: 'Failed to analyze failure' }, { status: 500 })
  }
}
