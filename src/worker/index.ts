import { createTestRunWorker, testRunQueue } from './bullmq.config'
import { db } from '@/db'
import { testRuns, testCases, environments } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { executePlaywrightTest } from './playwright.executor'
import { processTestResult } from './result.processor'

interface TestRunJobData {
  testRunId: string
  testCaseIds: string[]
  environmentId: string
}

async function processTestRunJob(data: TestRunJobData) {
  const { testRunId, testCaseIds, environmentId } = data

  await db.update(testRuns).set({
    status: 'running',
    startedAt: new Date()
  }).where(eq(testRuns.id, testRunId))

  const env = await db.query.environments.findFirst({
    where: eq(environments.id, environmentId)
  })

  if (!env) {
    throw new Error(`Environment ${environmentId} not found`)
  }

  for (const testCaseId of testCaseIds) {
    const testCase = await db.query.testCases.findFirst({
      where: eq(testCases.id, testCaseId)
    })

    if (!testCase?.generatedCode) continue

    const result = await executePlaywrightTest(testCase.generatedCode, {
      BASE_URL: env.baseUrl,
      ...env.variables
    })

    await processTestResult(testRunId, testCaseId, result)
  }
}

const worker = createTestRunWorker(processTestRunJob)

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

console.log('Worker started, waiting for jobs...')

process.on('SIGTERM', async () => {
  await worker.close()
  process.exit(0)
})
