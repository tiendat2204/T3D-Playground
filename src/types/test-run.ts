export type TestRunStatus = 'queued' | 'running' | 'passed' | 'failed' | 'cancelled'
export type TestRunResultStatus = 'passed' | 'failed' | 'skipped' | 'error'
export type RunType = 'smoke' | 'regression' | 'impacted' | 'manual'

export interface CreateTestRunInput {
  projectId: string
  environmentId: string
  runType?: RunType
  tags?: string[]
  testCaseIds?: string[]
}

export interface TestRunSummary {
  total: number
  passed: number
  failed: number
  skipped: number
  error: number
}

export interface TestRunWithResults {
  id: string
  projectId: string
  environmentId: string
  status: TestRunStatus
  runType: RunType
  tags: string[] | null
  startedAt: Date | null
  finishedAt: Date | null
  summary: TestRunSummary | null
  createdAt: Date
  results?: TestRunResultItem[]
}

export interface TestRunResultItem {
  id: string
  testCaseId: string
  status: TestRunResultStatus
  duration: number | null
  errorMessage: string | null
  screenshotUrl: string | null
  videoUrl: string | null
  traceUrl: string | null
  consoleLogs: string[] | null
  networkLogs: Array<{
    url: string
    method: string
    status: number
    duration: number
  }> | null
  testCase?: {
    title: string
    tags: string[]
  }
}
