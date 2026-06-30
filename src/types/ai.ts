export interface TestPlanSuite {
  name: string
  priority: 'high' | 'medium' | 'low'
  tags: string[]
  cases: TestPlanCase[]
}

export interface TestPlanCase {
  title: string
  steps: string[]
  expectedResult: string
  risk: string
  tags: string[]
}

export interface TestPlan {
  summary: string
  testSuites: TestPlanSuite[]
}

export interface FailureAnalysis {
  rootCause: string
  confidenceScore: number
  issueType: 'product_bug' | 'test_bug' | 'environment_issue' | 'unknown'
  suggestedFix: string
  saferLocatorSuggestion: string | null
  patchCode: string | null
  bugReport: {
    title: string
    stepsToReproduce: string[]
    expectedResult: string
    actualResult: string
    evidence: string[]
    aiAnalysis: string
  }
}

export type AIProviderType = 'openai' | 'anthropic' | 'gemini' | 'local'

export interface AIProviderConfig {
  type: AIProviderType
  apiKey?: string
  baseUrl?: string
  model?: string
}

export interface CachedAIResult {
  key: string
  result: unknown
  createdAt: Date
  expiresAt: Date
}
