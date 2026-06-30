export type BugReportStatus = 'open' | 'in-progress' | 'resolved' | 'closed'

export interface CreateBugReportInput {
  projectId: string
  testRunResultId?: string
  title: string
  module?: string
  environment?: string
  stepsToReproduce: string[]
  expectedResult: string
  actualResult: string
  evidence?: {
    screenshotUrl?: string
    videoUrl?: string
    traceUrl?: string
    consoleLogs?: string[]
  }
  aiAnalysis?: string
}

export interface UpdateBugReportInput {
  status?: BugReportStatus
  title?: string
}
