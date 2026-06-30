export interface CreateProjectInput {
  name: string
  baseUrl: string
  description?: string
  authConfig?: {
    loginUrl?: string
    emailSelector?: string
    passwordSelector?: string
    submitSelector?: string
    testAccounts?: Array<{ email: string; password: string; role: string }>
  }
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {}

export interface CreateEnvironmentInput {
  name: string
  baseUrl: string
  variables?: Record<string, string>
}

export interface CreateModuleInput {
  name: string
  routePattern?: string
  apiPatterns?: string[]
}
