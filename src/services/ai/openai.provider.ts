import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'
import {
  type AIProvider,
  type GenerateTestPlanParams,
  type GenerateCodeParams,
  type AnalyzeFailureParams
} from './provider.interface'
import { type TestPlan, type FailureAnalysis } from '@/types/ai'
import { getTestPlanSystemPrompt, getCodeGenerationPrompt, getFailureAnalysisPrompt } from './prompts'

const testPlanSchema = z.object({
  summary: z.string(),
  testSuites: z.array(z.object({
    name: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    tags: z.array(z.string()),
    cases: z.array(z.object({
      title: z.string(),
      steps: z.array(z.string()),
      expectedResult: z.string(),
      risk: z.string(),
      tags: z.array(z.string())
    }))
  }))
})

const failureAnalysisSchema = z.object({
  rootCause: z.string(),
  confidenceScore: z.number(),
  issueType: z.enum(['product_bug', 'test_bug', 'environment_issue', 'unknown']),
  suggestedFix: z.string(),
  saferLocatorSuggestion: z.string().nullable(),
  patchCode: z.string().nullable(),
  bugReport: z.object({
    title: z.string(),
    stepsToReproduce: z.array(z.string()),
    expectedResult: z.string(),
    actualResult: z.string(),
    evidence: z.array(z.string()),
    aiAnalysis: z.string()
  })
})

export class OpenAIProvider implements AIProvider {
  name = 'openai'
  private model: string

  constructor(model = 'gpt-4o') {
    this.model = model
  }

  async generateTestPlan(params: GenerateTestPlanParams): Promise<TestPlan> {
    const { object } = await generateObject({
      model: openai(this.model),
      schema: testPlanSchema,
      system: getTestPlanSystemPrompt(),
      prompt: `Create a Playwright test plan for:\nURL: ${params.url}\nGoal: ${params.goal}\nRole: ${params.role || 'User'}\nDestructive actions allowed: ${params.destructiveAllowed ? 'Yes' : 'No'}`
    })
    return object as TestPlan
  }

  async generatePlaywrightCode(params: GenerateCodeParams): Promise<string> {
    const prompt = getCodeGenerationPrompt(params)
    const { object } = await generateObject({
      model: openai(this.model),
      schema: z.object({ code: z.string() }),
      system: 'You are a senior Playwright TypeScript engineer. Generate only valid TypeScript code.',
      prompt
    })
    return object.code
  }

  async analyzeFailure(params: AnalyzeFailureParams): Promise<FailureAnalysis> {
    const prompt = getFailureAnalysisPrompt(params)
    const { object } = await generateObject({
      model: openai(this.model),
      schema: failureAnalysisSchema,
      system: 'You are a QA automation debugging assistant.',
      prompt
    })
    return object as FailureAnalysis
  }
}
