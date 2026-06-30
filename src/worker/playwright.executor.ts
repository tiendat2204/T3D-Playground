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
      // TODO: Parse JSON reporter output to extract structured test results
      `npx playwright test ${testFile} --reporter=json`,
      {
        env: { ...process.env, ...envVars },
        timeout: 300000 // 5 minutes
      }
    )

    const duration = Date.now() - startTime
    const consoleLogs = stderr.split('\n').filter(line => line.trim())

    return {
      status: 'passed',
      duration,
      consoleLogs
    }
  } catch (error: unknown) {
    const duration = Date.now() - startTime
    const err = error as { stdout?: string; stderr?: string; message?: string }

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
