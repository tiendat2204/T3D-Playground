import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'

const execAsync = promisify(exec)

export interface TestExecutionResult {
  status: 'passed' | 'failed' | 'error'
  duration: number
  errorMessage?: string
  screenshotPath?: string
  videoPath?: string
  tracePath?: string
  consoleLogs: string[]
}

interface PlaywrightJsonReport {
  stats: {
    expected: number
    unexpected: number
    flaky: number
    skipped: number
    duration: number
  }
  suites: Array<{
    specs: Array<{
      title: string
      ok: boolean
      tags: string[]
      tests: Array<{
        status: string
        duration: number
        errors: Array<{ message: string; stack?: string }>
      }>
    }>
  }>
  errors: string[]
}

function parseJsonReport(stdout: string): PlaywrightJsonReport | null {
  try {
    const lines = stdout.split('\n')
    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i].trim()
      if (line.startsWith('{') && line.endsWith('}')) {
        return JSON.parse(line) as PlaywrightJsonReport
      }
    }
    return null
  } catch {
    return null
  }
}

function extractErrors(report: PlaywrightJsonReport): string[] {
  const errors: string[] = []
  for (const suite of report.suites) {
    for (const spec of suite.specs) {
      for (const test of spec.tests) {
        if (test.errors.length > 0) {
          errors.push(...test.errors.map(e => e.message))
        }
      }
    }
  }
  return errors
}

export async function executePlaywrightTest(
  testCode: string,
  envVars: Record<string, string>
): Promise<TestExecutionResult> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'playwright-test-'))
  const testFile = path.join(tmpDir, 'test.spec.ts')

  await fs.writeFile(testFile, testCode)

  const startTime = Date.now()

  try {
    const { stdout, stderr } = await execAsync(
      `npx playwright test ${testFile} --reporter=json`,
      {
        env: { ...process.env, ...envVars },
        timeout: 300000
      }
    )

    const duration = Date.now() - startTime
    const consoleLogs = stderr.split('\n').filter(line => line.trim())
    const report = parseJsonReport(stdout)

    if (report) {
      const hasFailures = report.stats.unexpected > 0
      return {
        status: hasFailures ? 'failed' : 'passed',
        duration,
        errorMessage: hasFailures ? extractErrors(report).join('\n') : undefined,
        consoleLogs
      }
    }

    return {
      status: 'passed',
      duration,
      consoleLogs
    }
  } catch (error: unknown) {
    const duration = Date.now() - startTime
    const err = error as { stdout?: string; stderr?: string; message?: string }

    const report = parseJsonReport(err.stdout || '')
    if (report) {
      return {
        status: report.stats.unexpected > 0 ? 'failed' : 'error',
        duration,
        errorMessage: extractErrors(report).join('\n') || err.stderr || 'Test failed',
        consoleLogs: []
      }
    }

    return {
      status: 'failed',
      duration,
      errorMessage: err.stderr || err.message || 'Unknown error',
      consoleLogs: []
    }
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
}
