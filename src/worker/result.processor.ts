import { db } from '@/db'
import { testRuns, testRunResults } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { type TestExecutionResult } from './playwright.executor'

export async function processTestResult(
  testRunId: string,
  testCaseId: string,
  result: TestExecutionResult
) {
  await db.insert(testRunResults).values({
    id: crypto.randomUUID(),
    testRunId,
    testCaseId,
    status: result.status === 'error' ? 'error' : result.status,
    duration: result.duration,
    errorMessage: result.errorMessage || null,
    screenshotUrl: result.screenshotPath || null,
    videoUrl: result.videoPath || null,
    traceUrl: result.tracePath || null,
    consoleLogs: result.consoleLogs
  })

  await updateTestRunSummary(testRunId)
}

async function updateTestRunSummary(testRunId: string) {
  const results = await db.query.testRunResults.findMany({
    where: eq(testRunResults.testRunId, testRunId)
  })

  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    error: results.filter(r => r.status === 'error').length
  }

  const allComplete = results.length > 0 &&
    results.every(r => ['passed', 'failed', 'skipped', 'error'].includes(r.status))

  await db.update(testRuns).set({
    summary,
    status: allComplete ? (summary.failed > 0 ? 'failed' : 'passed') : undefined,
    finishedAt: allComplete ? new Date() : undefined
  }).where(eq(testRuns.id, testRunId))
}
