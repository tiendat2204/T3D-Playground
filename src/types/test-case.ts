export type TestCaseStatus = 'draft' | 'approved' | 'disabled'
export type Priority = 'high' | 'medium' | 'low'

export interface CreateTestCaseInput {
  projectId: string
  moduleId?: string
  title: string
  description?: string
  goal?: string
  tags?: string[]
  priority?: Priority
  generatedCode?: string
  createdByAi?: boolean
}

export interface UpdateTestCaseInput extends Partial<Omit<CreateTestCaseInput, 'projectId'>> {}

export interface GenerateTestPlanInput {
  projectId: string
  url: string
  goal: string
  role?: string
  destructiveAllowed?: boolean
}

export interface GenerateCodeInput {
  testCaseId: string
  environmentId: string
}
