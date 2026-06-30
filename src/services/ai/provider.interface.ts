import { type TestPlan, type FailureAnalysis } from '@/types/ai'

export interface GenerateTestPlanParams {
  url: string
  goal: string
  role?: string
  destructiveAllowed?: boolean
}

export interface GenerateCodeParams {
  testPlan: TestPlan
  testCase: {
    title: string
    steps: string[]
    expectedResult: string
  }
  baseUrl: string
  authConfig?: Record<string, unknown>
}

export interface AnalyzeFailureParams {
  testCode: string
  errorMessage: string
  screenshotDescription?: string
  consoleLogs?: string[]
  networkErrors?: Array<{ url: string; status: number }>
  currentUrl?: string
  failedStep?: string
}

export interface AIProvider {
  name: string
  generateTestPlan(params: GenerateTestPlanParams): Promise<TestPlan>
  generatePlaywrightCode(params: GenerateCodeParams): Promise<string>
  analyzeFailure(params: AnalyzeFailureParams): Promise<FailureAnalysis>
}
