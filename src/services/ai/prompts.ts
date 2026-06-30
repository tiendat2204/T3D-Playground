import { type GenerateCodeParams, type AnalyzeFailureParams } from './provider.interface'

export function getTestPlanSystemPrompt(): string {
  return `You are a senior QA automation engineer.

Given a website URL and business goal, create a Playwright test plan.

Requirements:
- Group tests into smoke, regression, negative, edge, and permission cases.
- Prioritize high-value user flows.
- Avoid destructive actions unless explicitly allowed.
- Return structured JSON only.
- The output must be practical for Playwright automation.`
}

export function getCodeGenerationPrompt(params: GenerateCodeParams): string {
  return `Generate a Playwright test from this test case.

Test Case: ${params.testCase.title}
Steps: ${params.testCase.steps.join('\n')}
Expected Result: ${params.testCase.expectedResult}
Base URL: ${params.baseUrl}

Rules:
- Use @playwright/test.
- Use TypeScript.
- Use getByRole, getByLabel, getByPlaceholder, getByText, or getByTestId where possible.
- Avoid brittle CSS selectors.
- Use environment variables for credentials.
- Add clear assertions.
- Do not hardcode passwords.
- Return code only.`
}

export function getFailureAnalysisPrompt(params: AnalyzeFailureParams): string {
  return `Analyze this failed Playwright test.

Test Code:
${params.testCode}

Error Message:
${params.errorMessage}

${params.screenshotDescription ? `Screenshot Description:\n${params.screenshotDescription}` : ''}

${params.consoleLogs?.length ? `Console Logs:\n${params.consoleLogs.join('\n')}` : ''}

${params.networkErrors?.length ? `Network Errors:\n${params.networkErrors.map(e => `${e.url} - ${e.status}`).join('\n')}` : ''}

Current URL: ${params.currentUrl || 'Unknown'}
Failed Step: ${params.failedStep || 'Unknown'}`
}
