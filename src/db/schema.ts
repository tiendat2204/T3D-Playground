import { relations } from 'drizzle-orm'
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  uniqueIndex
} from 'drizzle-orm/pg-core'

export const testCaseStatusEnum = pgEnum('TestCaseStatus', [
  'draft',
  'approved',
  'disabled'
])

export const testRunStatusEnum = pgEnum('TestRunStatus', [
  'queued',
  'running',
  'passed',
  'failed',
  'cancelled'
])

export const testRunResultStatusEnum = pgEnum('TestRunResultStatus', [
  'passed',
  'failed',
  'skipped',
  'error'
])

export const runTypeEnum = pgEnum('RunType', [
  'smoke',
  'regression',
  'impacted',
  'manual'
])

export const priorityEnum = pgEnum('Priority', [
  'high',
  'medium',
  'low'
])

export const suggestionStatusEnum = pgEnum('SuggestionStatus', [
  'pending',
  'approved',
  'rejected'
])

export const suggestionTypeEnum = pgEnum('SuggestionType', [
  'patch',
  'bug-report',
  'new-test'
])

export const bugReportStatusEnum = pgEnum('BugReportStatus', [
  'open',
  'in-progress',
  'resolved',
  'closed'
])

export const projects = pgTable('Project', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  baseUrl: text('baseUrl').notNull(),
  description: text('description'),
  authConfig: jsonb('authConfig').$type<{
    loginUrl?: string
    emailSelector?: string
    passwordSelector?: string
    submitSelector?: string
    testAccounts?: Array<{ email: string; password: string; role: string }>
  }>(),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull()
})

export const environments = pgTable('Environment', {
  id: text('id').primaryKey().notNull(),
  projectId: text('projectId').references(() => projects.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }).notNull(),
  name: text('name').notNull(),
  baseUrl: text('baseUrl').notNull(),
  variables: jsonb('variables').$type<Record<string, string>>().default({}).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull()
}, table => ({
  projectIdIdx: index('Environment_projectId_idx').on(table.projectId)
}))

export const modules = pgTable('Module', {
  id: text('id').primaryKey().notNull(),
  projectId: text('projectId').references(() => projects.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }).notNull(),
  name: text('name').notNull(),
  routePattern: text('routePattern'),
  apiPatterns: jsonb('apiPatterns').$type<string[]>().default([]),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull()
}, table => ({
  projectIdIdx: index('Module_projectId_idx').on(table.projectId)
}))

export const testCases = pgTable('TestCase', {
  id: text('id').primaryKey().notNull(),
  projectId: text('projectId').references(() => projects.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }).notNull(),
  moduleId: text('moduleId').references(() => modules.id, {
    onDelete: 'set null',
    onUpdate: 'cascade'
  }),
  title: text('title').notNull(),
  description: text('description'),
  goal: text('goal'),
  tags: jsonb('tags').$type<string[]>().default([]).notNull(),
  priority: priorityEnum('priority').default('medium').notNull(),
  status: testCaseStatusEnum('status').default('draft').notNull(),
  generatedCode: text('generatedCode'),
  createdByAi: boolean('createdByAi').default(false).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull()
}, table => ({
  projectIdIdx: index('TestCase_projectId_idx').on(table.projectId),
  moduleIdIdx: index('TestCase_moduleId_idx').on(table.moduleId),
  statusIdx: index('TestCase_status_idx').on(table.status)
}))

export const testRuns = pgTable('TestRun', {
  id: text('id').primaryKey().notNull(),
  projectId: text('projectId').references(() => projects.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }).notNull(),
  environmentId: text('environmentId').references(() => environments.id, {
    onDelete: 'restrict',
    onUpdate: 'cascade'
  }).notNull(),
  status: testRunStatusEnum('status').default('queued').notNull(),
  runType: runTypeEnum('runType').default('manual').notNull(),
  tags: jsonb('tags').$type<string[]>().default([]),
  startedAt: timestamp('startedAt', { mode: 'date', precision: 3 }),
  finishedAt: timestamp('finishedAt', { mode: 'date', precision: 3 }),
  summary: jsonb('summary').$type<{
    total: number
    passed: number
    failed: number
    skipped: number
    error: number
  }>(),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).defaultNow().notNull()
}, table => ({
  projectIdIdx: index('TestRun_projectId_idx').on(table.projectId),
  statusIdx: index('TestRun_status_idx').on(table.status)
}))

export const testRunResults = pgTable('TestRunResult', {
  id: text('id').primaryKey().notNull(),
  testRunId: text('testRunId').references(() => testRuns.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }).notNull(),
  testCaseId: text('testCaseId').references(() => testCases.id, {
    onDelete: 'restrict',
    onUpdate: 'cascade'
  }).notNull(),
  status: testRunResultStatusEnum('status').notNull(),
  duration: integer('duration'),
  errorMessage: text('errorMessage'),
  screenshotUrl: text('screenshotUrl'),
  videoUrl: text('videoUrl'),
  traceUrl: text('traceUrl'),
  consoleLogs: jsonb('consoleLogs').$type<string[]>(),
  networkLogs: jsonb('networkLogs').$type<Array<{
    url: string
    method: string
    status: number
    duration: number
  }>>(),
  aiAnalysis: jsonb('aiAnalysis').$type<{
    rootCause?: string
    confidenceScore?: number
    issueType?: string
    suggestedFix?: string
  }>(),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).defaultNow().notNull()
}, table => ({
  testRunIdIdx: index('TestRunResult_testRunId_idx').on(table.testRunId),
  testCaseIdIdx: index('TestRunResult_testCaseId_idx').on(table.testCaseId)
}))

export const aiSuggestions = pgTable('AiSuggestion', {
  id: text('id').primaryKey().notNull(),
  testCaseId: text('testCaseId').references(() => testCases.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }).notNull(),
  testRunResultId: text('testRunResultId').references(() => testRunResults.id, {
    onDelete: 'set null',
    onUpdate: 'cascade'
  }),
  suggestionType: suggestionTypeEnum('suggestionType').notNull(),
  oldCode: text('oldCode'),
  newCode: text('newCode').notNull(),
  explanation: text('explanation'),
  confidenceScore: real('confidenceScore'),
  status: suggestionStatusEnum('status').default('pending').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull()
}, table => ({
  testCaseIdIdx: index('AiSuggestion_testCaseId_idx').on(table.testCaseId),
  statusIdx: index('AiSuggestion_status_idx').on(table.status)
}))

export const bugReports = pgTable('BugReport', {
  id: text('id').primaryKey().notNull(),
  projectId: text('projectId').references(() => projects.id, {
    onDelete: 'cascade',
    onUpdate: 'cascade'
  }).notNull(),
  testRunResultId: text('testRunResultId').references(() => testRunResults.id, {
    onDelete: 'set null',
    onUpdate: 'cascade'
  }),
  title: text('title').notNull(),
  module: text('module'),
  environment: text('environment'),
  stepsToReproduce: jsonb('stepsToReproduce').$type<string[]>().notNull(),
  expectedResult: text('expectedResult').notNull(),
  actualResult: text('actualResult').notNull(),
  evidence: jsonb('evidence').$type<{
    screenshotUrl?: string
    videoUrl?: string
    traceUrl?: string
    consoleLogs?: string[]
  }>(),
  aiAnalysis: text('aiAnalysis'),
  status: bugReportStatusEnum('status').default('open').notNull(),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull()
}, table => ({
  projectIdIdx: index('BugReport_projectId_idx').on(table.projectId),
  statusIdx: index('BugReport_status_idx').on(table.status)
}))

export const promptTemplates = pgTable('PromptTemplate', {
  id: text('id').primaryKey().notNull(),
  name: text('name').notNull(),
  provider: text('provider').default('all').notNull(),
  systemPrompt: text('systemPrompt').notNull(),
  userPromptTemplate: text('userPromptTemplate').notNull(),
  variables: jsonb('variables').$type<string[]>().default([]).notNull(),
  isDefault: boolean('isDefault').default(false).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date', precision: 3 }).notNull()
})

// Relations
export const projectsRelations = relations(projects, ({ many }) => ({
  environments: many(environments),
  modules: many(modules),
  testCases: many(testCases),
  testRuns: many(testRuns),
  bugReports: many(bugReports)
}))

export const environmentsRelations = relations(environments, ({ one }) => ({
  project: one(projects, {
    fields: [environments.projectId],
    references: [projects.id]
  })
}))

export const modulesRelations = relations(modules, ({ one, many }) => ({
  project: one(projects, {
    fields: [modules.projectId],
    references: [projects.id]
  }),
  testCases: many(testCases)
}))

export const testCasesRelations = relations(testCases, ({ one, many }) => ({
  project: one(projects, {
    fields: [testCases.projectId],
    references: [projects.id]
  }),
  module: one(modules, {
    fields: [testCases.moduleId],
    references: [modules.id]
  }),
  results: many(testRunResults),
  suggestions: many(aiSuggestions)
}))

export const testRunsRelations = relations(testRuns, ({ one, many }) => ({
  project: one(projects, {
    fields: [testRuns.projectId],
    references: [projects.id]
  }),
  environment: one(environments, {
    fields: [testRuns.environmentId],
    references: [environments.id]
  }),
  results: many(testRunResults)
}))

export const testRunResultsRelations = relations(testRunResults, ({ one }) => ({
  testRun: one(testRuns, {
    fields: [testRunResults.testRunId],
    references: [testRuns.id]
  }),
  testCase: one(testCases, {
    fields: [testRunResults.testCaseId],
    references: [testCases.id]
  })
}))

export const aiSuggestionsRelations = relations(aiSuggestions, ({ one }) => ({
  testCase: one(testCases, {
    fields: [aiSuggestions.testCaseId],
    references: [testCases.id]
  }),
  testRunResult: one(testRunResults, {
    fields: [aiSuggestions.testRunResultId],
    references: [testRunResults.id]
  })
}))

export const bugReportsRelations = relations(bugReports, ({ one }) => ({
  project: one(projects, {
    fields: [bugReports.projectId],
    references: [projects.id]
  }),
  testRunResult: one(testRunResults, {
    fields: [bugReports.testRunResultId],
    references: [testRunResults.id]
  })
}))

// Types
export type Project = typeof projects.$inferSelect
export type Environment = typeof environments.$inferSelect
export type Module = typeof modules.$inferSelect
export type TestCase = typeof testCases.$inferSelect
export type TestRun = typeof testRuns.$inferSelect
export type TestRunResult = typeof testRunResults.$inferSelect
export type AiSuggestion = typeof aiSuggestions.$inferSelect
export type BugReport = typeof bugReports.$inferSelect
export type PromptTemplate = typeof promptTemplates.$inferSelect