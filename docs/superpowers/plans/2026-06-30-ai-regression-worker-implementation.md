# AI Regression Worker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an AI-powered regression testing platform that generates test plans, creates Playwright tests, executes them in background, and analyzes failures with AI.

**Architecture:** Standalone Next.js app with event-driven background worker. API routes produce jobs to Redis/BullMQ queue, separate worker process consumes jobs and runs Playwright tests. Multi-provider AI abstraction with caching and custom prompts.

**Tech Stack:** Next.js 16, React 19, TypeScript, Drizzle ORM (PostgreSQL), Redis + BullMQ, Playwright, TanStack Query, shadcn/ui, Tailwind CSS v4

## Global Constraints

- Node.js 20+ required
- PostgreSQL 15+ required
- Redis 7+ required
- Use `pnpm` as package manager
- Follow TA-Nature coding patterns (single schema.ts, text IDs, jsonb for flexible data)
- All AI credentials via environment variables only
- Destructive actions require explicit permission flag
- Tests use `@playwright/test` with TypeScript

---

## File Structure

```
T3D-Playground/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                    # Dashboard layout with sidebar
│   │   │   ├── dashboard/page.tsx            # Main dashboard
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx                  # Project list
│   │   │   │   ├── new/page.tsx              # Create project
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx              # Project detail
│   │   │   │       ├── environments/page.tsx
│   │   │   │       ├── modules/page.tsx
│   │   │   │       ├── test-cases/page.tsx
│   │   │   │       └── test-runs/page.tsx
│   │   │   ├── test-cases/
│   │   │   │   ├── page.tsx                  # Global test case list
│   │   │   │   └── [id]/page.tsx             # Test case detail
│   │   │   ├── test-runs/
│   │   │   │   ├── page.tsx                  # Global test run list
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx              # Run detail
│   │   │   │       └── results/[resultId]/page.tsx
│   │   │   ├── ai-generate/page.tsx          # AI generation wizard
│   │   │   ├── ai-suggestions/page.tsx       # Suggestion queue
│   │   │   ├── bug-reports/
│   │   │   │   ├── page.tsx                  # Bug report list
│   │   │   │   └── [id]/page.tsx             # Bug report detail
│   │   │   └── settings/page.tsx             # AI provider settings
│   │   ├── api/
│   │   │   ├── projects/
│   │   │   │   ├── route.ts                  # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts              # GET, PUT, DELETE
│   │   │   │       ├── environments/route.ts
│   │   │   │       └── modules/route.ts
│   │   │   ├── environments/[id]/route.ts    # PUT, DELETE
│   │   │   ├── test-cases/
│   │   │   │   ├── route.ts                  # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts              # GET, PUT
│   │   │   │       ├── approve/route.ts      # POST
│   │   │   │       └── disable/route.ts      # POST
│   │   │   ├── test-runs/
│   │   │   │   ├── route.ts                  # GET, POST
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts              # GET
│   │   │   │       └── cancel/route.ts       # POST
│   │   │   ├── ai/
│   │   │   │   ├── generate-plan/route.ts
│   │   │   │   ├── generate-code/route.ts
│   │   │   │   ├── analyze-failure/route.ts
│   │   │   │   └── suggest-patch/route.ts
│   │   │   ├── bug-reports/
│   │   │   │   ├── route.ts                  # GET, POST
│   │   │   │   └── [id]/route.ts             # GET, PUT
│   │   │   └── prompt-templates/
│   │   │       ├── route.ts                  # GET, POST
│   │   │       └── [id]/route.ts             # GET, PUT, DELETE
│   │   ├── layout.tsx                        # Root layout
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                               # shadcn components
│   │   ├── layout/
│   │   │   ├── sidebar.tsx
│   │   │   ├── header.tsx
│   │   │   └── providers.tsx
│   │   ├── projects/
│   │   │   ├── project-form.tsx
│   │   │   └── project-card.tsx
│   │   ├── test-cases/
│   │   │   ├── test-case-table.tsx
│   │   │   ├── test-case-form.tsx
│   │   │   └── code-viewer.tsx
│   │   ├── test-runs/
│   │   │   ├── test-run-table.tsx
│   │   │   ├── test-run-detail.tsx
│   │   │   └── result-viewer.tsx
│   │   ├── ai/
│   │   │   ├── generation-wizard.tsx
│   │   │   ├── streaming-output.tsx
│   │   │   └── suggestion-diff.tsx
│   │   ├── dashboard/
│   │   │   ├── metrics-cards.tsx
│   │   │   ├── pass-fail-chart.tsx
│   │   │   └── recent-runs.tsx
│   │   └── bug-reports/
│   │       ├── bug-report-table.tsx
│   │       └── bug-report-detail.tsx
│   ├── hooks/
│   │   ├── use-projects.ts
│   │   ├── use-test-cases.ts
│   │   ├── use-test-runs.ts
│   │   ├── use-ai.ts
│   │   └── use-bug-reports.ts
│   ├── lib/
│   │   ├── api-client.ts
│   │   ├── utils.ts
│   │   └── constants.ts
│   ├── services/
│   │   ├── ai/
│   │   │   ├── provider.interface.ts
│   │   │   ├── openai.provider.ts
│   │   │   ├── anthropic.provider.ts
│   │   │   ├── gemini.provider.ts
│   │   │   ├── local.provider.ts
│   │   │   ├── cache.ts
│   │   │   ├── prompts.ts
│   │   │   └── index.ts
│   │   ├── projects.service.ts
│   │   ├── test-cases.service.ts
│   │   ├── test-runs.service.ts
│   │   └── bug-reports.service.ts
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── types/
│   │   ├── project.ts
│   │   ├── test-case.ts
│   │   ├── test-run.ts
│   │   ├── ai.ts
│   │   └── bug-report.ts
│   └── worker/
│       ├── index.ts
│       ├── bullmq.config.ts
│       ├── playwright.executor.ts
│       └── result.processor.ts
├── drizzle/
│   ├── migrations/
│   └── seed.ts
├── docker-compose.yml
├── drizzle.config.ts
├── package.json
└── README.md
```

---

## Task 1: Project Setup & Dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `drizzle.config.ts`
- Create: `docker-compose.yml`
- Create: `.env.example`
- Create: `.gitignore`

**Interfaces:**
- Consumes: (none - initial setup)
- Produces: Project foundation for all subsequent tasks

- [ ] **Step 1: Initialize package.json**

```json
{
  "name": "ai-regression-worker",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbopack",
    "dev:worker": "npx tsx src/worker/index.ts",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "next": "16.1.1",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "@tanstack/react-query": "^5.90.11",
    "@tanstack/react-table": "^8.21.3",
    "drizzle-orm": "^0.45.1",
    "pg": "^8.20.0",
    "redis": "^4.7.0",
    "bullmq": "^5.30.0",
    "@playwright/test": "^1.61.0",
    "ai": "^6.0.140",
    "@ai-sdk/openai": "^3.0.48",
    "@ai-sdk/anthropic": "^1.0.0",
    "@ai-sdk/google": "^1.0.0",
    "zod": "^4.1.13",
    "zustand": "^5.0.9",
    "lucide-react": "^0.554.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.1",
    "class-variance-authority": "^0.7.1",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-tabs": "^1.1.13",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-toast": "^1.2.14",
    "react-hook-form": "^7.67.0",
    "@hookform/resolvers": "^5.2.2",
    "recharts": "3.8.0",
    "monaco-editor": "^0.52.0",
    "@monaco-editor/react": "^4.7.0",
    "sonner": "^2.0.7",
    "date-fns": "^4.1.0",
    "axios": "^1.13.2"
  },
  "devDependencies": {
    "typescript": "5.5.4",
    "@types/node": "^20",
    "@types/react": "19.2.2",
    "@types/react-dom": "19.2.2",
    "drizzle-kit": "^0.31.9",
    "tsx": "^4.21.0",
    "tailwindcss": "^4.1.14",
    "@tailwindcss/postcss": "^4.1.14",
    "postcss": "^8",
    "eslint": "9.22.0",
    "eslint-config-next": "16.0.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create drizzle.config.ts**

```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
})
```

- [ ] **Step 4: Create docker-compose.yml**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ai_worker
      POSTGRES_PASSWORD: ai_worker_dev
      POSTGRES_DB: ai_regression_worker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

- [ ] **Step 5: Create .env.example**

```env
# Database
DATABASE_URL=postgresql://ai_worker:ai_worker_dev@localhost:5432/ai_regression_worker

# Redis
REDIS_URL=redis://localhost:6379

# AI Providers (at least one required)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=

# Local AI (optional)
OLLAMA_BASE_URL=http://localhost:11434

# Storage (optional - for screenshots/videos)
S3_BUCKET=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_ENDPOINT=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 6: Create .gitignore**

```
node_modules/
.next/
.env
.env.local
dist/
test-results/
playwright-report/
```

- [ ] **Step 7: Install dependencies**

Run: `pnpm install`

- [ ] **Step 8: Commit**

```bash
git init
git add package.json tsconfig.json drizzle.config.ts docker-compose.yml .env.example .gitignore
git commit -m "feat: initialize project with dependencies and config"
```

---

## Task 2: Database Schema

**Files:**
- Create: `src/db/index.ts`
- Create: `src/db/schema.ts`
- Create: `drizzle/seed.ts`

**Interfaces:**
- Consumes: Task 1 (project setup)
- Produces: Database tables for all entities

- [ ] **Step 1: Create src/db/index.ts**

```typescript
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

export const db = drizzle(pool, { schema })
```

- [ ] **Step 2: Create src/db/schema.ts**

```typescript
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
```

- [ ] **Step 3: Generate migration**

Run: `pnpm db:generate`

- [ ] **Step 4: Push to database**

Run: `pnpm db:push`

- [ ] **Step 5: Commit**

```bash
git add src/db/ drizzle/
git commit -m "feat: add database schema with all entities"
```

---

## Task 3: Type Definitions

**Files:**
- Create: `src/types/project.ts`
- Create: `src/types/test-case.ts`
- Create: `src/types/test-run.ts`
- Create: `src/types/ai.ts`
- Create: `src/types/bug-report.ts`

**Interfaces:**
- Consumes: Task 2 (database schema)
- Produces: TypeScript types for API and frontend

- [ ] **Step 1: Create src/types/project.ts**

```typescript
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
```

- [ ] **Step 2: Create src/types/test-case.ts**

```typescript
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
```

- [ ] **Step 3: Create src/types/test-run.ts**

```typescript
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
```

- [ ] **Step 4: Create src/types/ai.ts**

```typescript
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
```

- [ ] **Step 5: Create src/types/bug-report.ts**

```typescript
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
```

- [ ] **Step 6: Commit**

```bash
git add src/types/
git commit -m "feat: add TypeScript types for all entities"
```

---

## Task 4: API Client & Utility Functions

**Files:**
- Create: `src/lib/api-client.ts`
- Create: `src/lib/utils.ts`
- Create: `src/lib/constants.ts`

**Interfaces:**
- Consumes: Task 3 (types)
- Produces: API client for frontend hooks

- [ ] **Step 1: Create src/lib/utils.ts**

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  const seconds = Math.floor(ms / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}
```

- [ ] **Step 2: Create src/lib/constants.ts**

```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export const TEST_CASE_STATUSES = ['draft', 'approved', 'disabled'] as const
export const TEST_RUN_STATUSES = ['queued', 'running', 'passed', 'failed', 'cancelled'] as const
export const RUN_TYPES = ['smoke', 'regression', 'impacted', 'manual'] as const
export const PRIORITIES = ['high', 'medium', 'low'] as const
export const BUG_REPORT_STATUSES = ['open', 'in-progress', 'resolved', 'closed'] as const

export const TAG_PRESETS = [
  '@smoke',
  '@regression',
  '@product',
  '@order',
  '@customer',
  '@auth',
  '@permission',
  '@import',
  '@new-feature'
] as const
```

- [ ] **Step 3: Create src/lib/api-client.ts**

```typescript
import axios, { AxiosError } from 'axios'
import { API_BASE_URL } from './constants'

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.response.use(
  response => response.data,
  (error: AxiosError<{ error: string }>) => {
    const message = error.response?.data?.error || error.message
    return Promise.reject(new Error(message))
  }
)

export const api = {
  projects: {
    list: () => apiClient.get('/projects'),
    get: (id: string) => apiClient.get(`/projects/${id}`),
    create: (data: unknown) => apiClient.post('/projects', data),
    update: (id: string, data: unknown) => apiClient.put(`/projects/${id}`, data),
    delete: (id: string) => apiClient.delete(`/projects/${id}`)
  },
  environments: {
    list: (projectId: string) => apiClient.get(`/projects/${projectId}/environments`),
    create: (projectId: string, data: unknown) => apiClient.post(`/projects/${projectId}/environments`, data),
    update: (id: string, data: unknown) => apiClient.put(`/environments/${id}`, data),
    delete: (id: string) => apiClient.delete(`/environments/${id}`)
  },
  modules: {
    list: (projectId: string) => apiClient.get(`/projects/${projectId}/modules`),
    create: (projectId: string, data: unknown) => apiClient.post(`/projects/${projectId}/modules`, data)
  },
  testCases: {
    list: (params?: Record<string, string>) => apiClient.get('/test-cases', { params }),
    get: (id: string) => apiClient.get(`/test-cases/${id}`),
    create: (data: unknown) => apiClient.post('/test-cases', data),
    update: (id: string, data: unknown) => apiClient.put(`/test-cases/${id}`, data),
    approve: (id: string) => apiClient.post(`/test-cases/${id}/approve`),
    disable: (id: string) => apiClient.post(`/test-cases/${id}/disable`)
  },
  testRuns: {
    list: (params?: Record<string, string>) => apiClient.get('/test-runs', { params }),
    get: (id: string) => apiClient.get(`/test-runs/${id}`),
    create: (data: unknown) => apiClient.post('/test-runs', data),
    cancel: (id: string) => apiClient.post(`/test-runs/${id}/cancel`)
  },
  ai: {
    generatePlan: (data: unknown) => apiClient.post('/ai/generate-plan', data),
    generateCode: (data: unknown) => apiClient.post('/ai/generate-code', data),
    analyzeFailure: (data: unknown) => apiClient.post('/ai/analyze-failure', data),
    suggestPatch: (data: unknown) => apiClient.post('/ai/suggest-patch', data)
  },
  bugReports: {
    list: (params?: Record<string, string>) => apiClient.get('/bug-reports', { params }),
    get: (id: string) => apiClient.get(`/bug-reports/${id}`),
    create: (data: unknown) => apiClient.post('/bug-reports', data),
    update: (id: string, data: unknown) => apiClient.put(`/bug-reports/${id}`, data)
  }
}

export default apiClient
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/
git commit -m "feat: add API client and utility functions"
```

---

## Task 5: AI Services Layer

**Files:**
- Create: `src/services/ai/provider.interface.ts`
- Create: `src/services/ai/openai.provider.ts`
- Create: `src/services/ai/cache.ts`
- Create: `src/services/ai/prompts.ts`
- Create: `src/services/ai/index.ts`

**Interfaces:**
- Consumes: Task 3 (types)
- Produces: AI service for test planning, code generation, failure analysis

- [ ] **Step 1: Create src/services/ai/provider.interface.ts**

```typescript
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
```

- [ ] **Step 2: Create src/services/ai/openai.provider.ts**

```typescript
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
```

- [ ] **Step 3: Create src/services/ai/cache.ts**

```typescript
import { Redis } from 'redis'
import { type CachedAIResult } from '@/types/ai'

const TTL_SECONDS = {
  testPlan: 86400,      // 24 hours
  codeGeneration: 604800, // 7 days
  failureAnalysis: 3600   // 1 hour
}

export class AICache {
  private redis: Redis | null = null
  private prefix = 'ai-cache:'

  async connect() {
    this.redis = Redis.fromUrl(process.env.REDIS_URL || 'redis://localhost:6379')
    await this.redis.connect()
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null
    const data = await this.redis.get(`${this.prefix}${key}`)
    if (!data) return null
    const cached: CachedAIResult = JSON.parse(data)
    if (new Date(cached.expiresAt) < new Date()) {
      await this.redis.del(`${this.prefix}${key}`)
      return null
    }
    return cached.result as T
  }

  async set(key: string, result: unknown, ttlType: keyof typeof TTL_SECONDS) {
    if (!this.redis) return
    const ttl = TTL_SECONDS[ttlType]
    const cached: CachedAIResult = {
      key,
      result,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + ttl * 1000)
    }
    await this.redis.setEx(`${this.prefix}${key}`, ttl, JSON.stringify(cached))
  }

  async invalidate(pattern: string) {
    if (!this.redis) return
    const keys = await this.redis.keys(`${this.prefix}${pattern}`)
    if (keys.length > 0) {
      await this.redis.del(keys)
    }
  }
}

export const aiCache = new AICache()
```

- [ ] **Step 4: Create src/services/ai/prompts.ts**

```typescript
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
```

- [ ] **Step 5: Create src/services/ai/index.ts**

```typescript
import { type AIProvider, type AIProviderConfig } from '@/types/ai'
import { OpenAIProvider } from './openai.provider'
import { aiCache } from './cache'

let defaultProvider: AIProvider | null = null

export function getAIProvider(config?: AIProviderConfig): AIProvider {
  const providerType = config?.type || 'openai'
  const model = config?.model

  switch (providerType) {
    case 'openai':
      return new OpenAIProvider(model)
    case 'anthropic':
      // TODO: Implement Anthropic provider
      throw new Error('Anthropic provider not yet implemented')
    case 'gemini':
      // TODO: Implement Gemini provider
      throw new Error('Gemini provider not yet implemented')
    case 'local':
      // TODO: Implement Local provider
      throw new Error('Local provider not yet implemented')
    default:
      return new OpenAIProvider(model)
  }
}

export function setDefaultProvider(provider: AIProvider) {
  defaultProvider = provider
}

export function getDefaultProvider(): AIProvider {
  if (!defaultProvider) {
    defaultProvider = new OpenAIProvider()
  }
  return defaultProvider
}

export { aiCache }
```

- [ ] **Step 6: Commit**

```bash
git add src/services/ai/
git commit -m "feat: add AI services layer with OpenAI provider and caching"
```

---

## Task 6: Background Worker

**Files:**
- Create: `src/worker/index.ts`
- Create: `src/worker/bullmq.config.ts`
- Create: `src/worker/playwright.executor.ts`
- Create: `src/worker/result.processor.ts`

**Interfaces:**
- Consumes: Task 2 (database), Task 5 (AI services)
- Produces: Worker that processes test run jobs

- [ ] **Step 1: Create src/worker/bullmq.config.ts**

```typescript
import { Queue, Worker } from 'bullmq'
import IORedis from 'ioredis'

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null
})

export const testRunQueue = new Queue('test-runs', { connection })

export function createTestRunWorker(processor: (jobData: unknown) => Promise<void>) {
  return new Worker('test-runs', async job => {
    await processor(job.data)
  }, { connection })
}
```

- [ ] **Step 2: Create src/worker/playwright.executor.ts**

```typescript
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
  const envString = Object.entries(envVars)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')

  try {
    const { stdout, stderr } = await execAsync(
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
```

- [ ] **Step 3: Create src/worker/result.processor.ts**

```typescript
import { db } from '@/db'
import { testRuns, testRunResults } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { type TestExecutionResult } from './playwright.executor'

export async function processTestResult(
  testRunId: string,
  testCaseId: string,
  result: TestExecutionResult
) {
  await db.insert(testRunResults).values({
    id: crypto.randomUUID(),
    testRunId,
    testCaseId,
    status: result.status === 'error' ? 'error' : result.status,
    duration: result.duration,
    errorMessage: result.errorMessage || null,
    screenshotUrl: result.screenshotPath || null,
    videoUrl: result.videoPath || null,
    traceUrl: result.tracePath || null,
    consoleLogs: result.consoleLogs
  })

  await updateTestRunSummary(testRunId)
}

async function updateTestRunSummary(testRunId: string) {
  const results = await db.query.testRunResults.findMany({
    where: eq(testRunResults.testRunId, testRunId)
  })

  const summary = {
    total: results.length,
    passed: results.filter(r => r.status === 'passed').length,
    failed: results.filter(r => r.status === 'failed').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    error: results.filter(r => r.status === 'error').length
  }

  const allComplete = results.length > 0 &&
    results.every(r => ['passed', 'failed', 'skipped', 'error'].includes(r.status))

  await db.update(testRuns).set({
    summary,
    status: allComplete ? (summary.failed > 0 ? 'failed' : 'passed') : undefined,
    finishedAt: allComplete ? new Date() : undefined
  }).where(eq(testRuns.id, testRunId))
}
```

- [ ] **Step 4: Create src/worker/index.ts**

```typescript
import { createTestRunWorker, testRunQueue } from './bullmq.config'
import { db } from '@/db'
import { testRuns, testCases, environments } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { executePlaywrightTest } from './playwright.executor'
import { processTestResult } from './result.processor'

interface TestRunJobData {
  testRunId: string
  testCaseIds: string[]
  environmentId: string
}

async function processTestRunJob(data: TestRunJobData) {
  const { testRunId, testCaseIds, environmentId } = data

  await db.update(testRuns).set({
    status: 'running',
    startedAt: new Date()
  }).where(eq(testRuns.id, testRunId))

  const env = await db.query.environments.findFirst({
    where: eq(environments.id, environmentId)
  })

  if (!env) {
    throw new Error(`Environment ${environmentId} not found`)
  }

  for (const testCaseId of testCaseIds) {
    const testCase = await db.query.testCases.findFirst({
      where: eq(testCases.id, testCaseId)
    })

    if (!testCase?.generatedCode) continue

    const result = await executePlaywrightTest(testCase.generatedCode, {
      BASE_URL: env.baseUrl,
      ...env.variables
    })

    await processTestResult(testRunId, testCaseId, result)
  }
}

const worker = createTestRunWorker(processTestRunJob)

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

console.log('Worker started, waiting for jobs...')

process.on('SIGTERM', async () => {
  await worker.close()
  process.exit(0)
})
```

- [ ] **Step 5: Commit**

```bash
git add src/worker/
git commit -m "feat: add background worker with BullMQ and Playwright execution"
```

---

## Task 7: API Routes - Projects

**Files:**
- Create: `src/app/api/projects/route.ts`
- Create: `src/app/api/projects/[id]/route.ts`
- Create: `src/app/api/projects/[id]/environments/route.ts`
- Create: `src/app/api/projects/[id]/modules/route.ts`

**Interfaces:**
- Consumes: Task 2 (database), Task 3 (types)
- Produces: CRUD APIs for projects, environments, modules

- [ ] **Step 1: Create src/app/api/projects/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET() {
  const allProjects = await db.query.projects.findMany({
    orderBy: [desc(projects.createdAt)]
  })
  return NextResponse.json(allProjects)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { name, baseUrl, description, authConfig } = body

  const project = await db.insert(projects).values({
    id: generateId(),
    name,
    baseUrl,
    description,
    authConfig,
    updatedAt: new Date()
  }).returning()

  return NextResponse.json(project[0], { status: 201 })
}
```

- [ ] **Step 2: Create src/app/api/projects/[id]/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { projects } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id)
  })

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json(project)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updated = await db.update(projects).set({
    ...body,
    updatedAt: new Date()
  }).where(eq(projects.id, id)).returning()

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json(updated[0])
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = await db.delete(projects).where(eq(projects.id, id)).returning()

  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
```

- [ ] **Step 3: Create src/app/api/projects/[id]/environments/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { environments } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const projectEnvironments = await db.query.environments.findMany({
    where: eq(environments.projectId, id)
  })
  return NextResponse.json(projectEnvironments)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { name, baseUrl, variables } = body

  const environment = await db.insert(environments).values({
    id: generateId(),
    projectId: id,
    name,
    baseUrl,
    variables,
    updatedAt: new Date()
  }).returning()

  return NextResponse.json(environment[0], { status: 201 })
}
```

- [ ] **Step 4: Create src/app/api/projects/[id]/modules/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { modules } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const projectModules = await db.query.modules.findMany({
    where: eq(modules.projectId, id)
  })
  return NextResponse.json(projectModules)
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()
  const { name, routePattern, apiPatterns } = body

  const module = await db.insert(modules).values({
    id: generateId(),
    projectId: id,
    name,
    routePattern,
    apiPatterns,
    updatedAt: new Date()
  }).returning()

  return NextResponse.json(module[0], { status: 201 })
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/projects/
git commit -m "feat: add project, environment, and module API routes"
```

---

## Task 8: API Routes - Test Cases

**Files:**
- Create: `src/app/api/test-cases/route.ts`
- Create: `src/app/api/test-cases/[id]/route.ts`
- Create: `src/app/api/test-cases/[id]/approve/route.ts`
- Create: `src/app/api/test-cases/[id]/disable/route.ts`

**Interfaces:**
- Consumes: Task 2 (database), Task 3 (types)
- Produces: CRUD APIs for test cases

- [ ] **Step 1: Create src/app/api/test-cases/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testCases } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const moduleId = searchParams.get('moduleId')
  const status = searchParams.get('status')
  const tag = searchParams.get('tag')

  const conditions = []
  if (projectId) conditions.push(eq(testCases.projectId, projectId))
  if (moduleId) conditions.push(eq(testCases.moduleId, moduleId))
  if (status) conditions.push(eq(testCases.status, status as 'draft' | 'approved' | 'disabled'))

  let query = db.query.testCases.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(testCases.createdAt)],
    with: {
      module: true
    }
  })

  let results = await query

  if (tag) {
    results = results.filter(tc =>
      tc.tags?.includes(tag)
    )
  }

  return NextResponse.json(results)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { projectId, moduleId, title, description, goal, tags, priority, generatedCode, createdByAi } = body

  const testCase = await db.insert(testCases).values({
    id: generateId(),
    projectId,
    moduleId,
    title,
    description,
    goal,
    tags,
    priority,
    generatedCode,
    createdByAi,
    updatedAt: new Date()
  }).returning()

  return NextResponse.json(testCase[0], { status: 201 })
}
```

- [ ] **Step 2: Create src/app/api/test-cases/[id]/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testCases } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const testCase = await db.query.testCases.findFirst({
    where: eq(testCases.id, id),
    with: {
      module: true,
      suggestions: true
    }
  })

  if (!testCase) {
    return NextResponse.json({ error: 'Test case not found' }, { status: 404 })
  }

  return NextResponse.json(testCase)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updated = await db.update(testCases).set({
    ...body,
    updatedAt: new Date()
  }).where(eq(testCases.id, id)).returning()

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Test case not found' }, { status: 404 })
  }

  return NextResponse.json(updated[0])
}
```

- [ ] **Step 3: Create src/app/api/test-cases/[id]/approve/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testCases } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const updated = await db.update(testCases).set({
    status: 'approved',
    updatedAt: new Date()
  }).where(eq(testCases.id, id)).returning()

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Test case not found' }, { status: 404 })
  }

  return NextResponse.json(updated[0])
}
```

- [ ] **Step 4: Create src/app/api/test-cases/[id]/disable/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testCases } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const updated = await db.update(testCases).set({
    status: 'disabled',
    updatedAt: new Date()
  }).where(eq(testCases.id, id)).returning()

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Test case not found' }, { status: 404 })
  }

  return NextResponse.json(updated[0])
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/test-cases/
git commit -m "feat: add test case API routes with approve/disable"
```

---

## Task 9: API Routes - Test Runs

**Files:**
- Create: `src/app/api/test-runs/route.ts`
- Create: `src/app/api/test-runs/[id]/route.ts`
- Create: `src/app/api/test-runs/[id]/cancel/route.ts`

**Interfaces:**
- Consumes: Task 2 (database), Task 6 (worker queue)
- Produces: API routes to trigger and manage test runs

- [ ] **Step 1: Create src/app/api/test-runs/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testRuns, testCases } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { generateId } from '@/lib/utils'
import { testRunQueue } from '@/worker/bullmq.config'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')

  const conditions = []
  if (projectId) conditions.push(eq(testRuns.projectId, projectId))
  if (status) conditions.push(eq(testRuns.status, status as 'queued' | 'running' | 'passed' | 'failed' | 'cancelled'))

  const results = await db.query.testRuns.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(testRuns.createdAt)],
    with: {
      environment: true
    }
  })

  return NextResponse.json(results)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { projectId, environmentId, runType, tags, testCaseIds } = body

  let testCasesToRun = testCaseIds

  if (!testCasesToRun || testCasesToRun.length === 0) {
    const conditions = [eq(testCases.projectId, projectId), eq(testCases.status, 'approved')]

    if (tags && tags.length > 0) {
      const allCases = await db.query.testCases.findMany({
        where: and(...conditions)
      })
      testCasesToRun = allCases
        .filter(tc => tags.some(tag => tc.tags?.includes(tag)))
        .map(tc => tc.id)
    } else {
      const allCases = await db.query.testCases.findMany({
        where: and(...conditions)
      })
      testCasesToRun = allCases.map(tc => tc.id)
    }
  }

  const testRun = await db.insert(testRuns).values({
    id: generateId(),
    projectId,
    environmentId,
    runType: runType || 'manual',
    tags,
    summary: {
      total: testCasesToRun.length,
      passed: 0,
      failed: 0,
      skipped: 0,
      error: 0
    }
  }).returning()

  await testRunQueue.add('run-tests', {
    testRunId: testRun[0].id,
    testCaseIds: testCasesToRun,
    environmentId
  })

  return NextResponse.json(testRun[0], { status: 201 })
}
```

- [ ] **Step 2: Create src/app/api/test-runs/[id]/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testRuns, testRunResults } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const testRun = await db.query.testRuns.findFirst({
    where: eq(testRuns.id, id),
    with: {
      environment: true,
      results: {
        with: {
          testCase: true
        }
      }
    }
  })

  if (!testRun) {
    return NextResponse.json({ error: 'Test run not found' }, { status: 404 })
  }

  return NextResponse.json(testRun)
}
```

- [ ] **Step 3: Create src/app/api/test-runs/[id]/cancel/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { testRuns } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const testRun = await db.query.testRuns.findFirst({
    where: eq(testRuns.id, id)
  })

  if (!testRun) {
    return NextResponse.json({ error: 'Test run not found' }, { status: 404 })
  }

  if (testRun.status !== 'queued' && testRun.status !== 'running') {
    return NextResponse.json({ error: 'Cannot cancel completed test run' }, { status: 400 })
  }

  const updated = await db.update(testRuns).set({
    status: 'cancelled',
    finishedAt: new Date()
  }).where(eq(testRuns.id, id)).returning()

  return NextResponse.json(updated[0])
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/test-runs/
git commit -m "feat: add test run API routes with queue integration"
```

---

## Task 10: API Routes - AI Services

**Files:**
- Create: `src/app/api/ai/generate-plan/route.ts`
- Create: `src/app/api/ai/generate-code/route.ts`
- Create: `src/app/api/ai/analyze-failure/route.ts`

**Interfaces:**
- Consumes: Task 5 (AI services), Task 2 (database)
- Produces: AI generation endpoints

- [ ] **Step 1: Create src/app/api/ai/generate-plan/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { getDefaultProvider, aiCache } from '@/services/ai'
import { db } from '@/db'
import { testCases, modules } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function POST(request: Request) {
  const body = await request.json()
  const { projectId, url, goal, role, destructiveAllowed } = body

  const cacheKey = `plan:${url}:${goal}:${role || 'user'}`
  const cached = await aiCache.get(cacheKey)
  if (cached) {
    return NextResponse.json(cached)
  }

  const provider = getDefaultProvider()
  const testPlan = await provider.generateTestPlan({
    url,
    goal,
    role,
    destructiveAllowed
  })

  await aiCache.set(cacheKey, testPlan, 'testPlan')

  const projectModules = await db.query.modules.findMany({
    where: eq(modules.projectId, projectId)
  })

  for (const suite of testPlan.testSuites) {
    for (const testCase of suite.cases) {
      const matchingModule = projectModules.find(m =>
        testCase.tags.some(tag => tag.includes(m.name.toLowerCase()))
      )

      await db.insert(testCases).values({
        id: generateId(),
        projectId,
        moduleId: matchingModule?.id || null,
        title: testCase.title,
        description: testCase.steps.join('\n'),
        goal: testCase.expectedResult,
        tags: testCase.tags,
        priority: suite.priority,
        status: 'draft',
        createdByAi: true,
        updatedAt: new Date()
      })
    }
  }

  return NextResponse.json(testPlan)
}
```

- [ ] **Step 2: Create src/app/api/ai/generate-code/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { getDefaultProvider, aiCache } from '@/services/ai'
import { db } from '@/db'
import { testCases, projects, environments } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  const body = await request.json()
  const { testCaseId, environmentId } = body

  const testCase = await db.query.testCases.findFirst({
    where: eq(testCases.id, testCaseId)
  })

  if (!testCase) {
    return NextResponse.json({ error: 'Test case not found' }, { status: 404 })
  }

  const environment = await db.query.environments.findFirst({
    where: eq(environments.id, environmentId)
  })

  if (!environment) {
    return NextResponse.json({ error: 'Environment not found' }, { status: 404 })
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, testCase.projectId)
  })

  const cacheKey = `code:${testCaseId}:${environmentId}`
  const cached = await aiCache.get<string>(cacheKey)
  if (cached) {
    return NextResponse.json({ code: cached })
  }

  const provider = getDefaultProvider()
  const code = await provider.generatePlaywrightCode({
    testPlan: {
      summary: '',
      testSuites: [{
        name: '',
        priority: testCase.priority as 'high' | 'medium' | 'low',
        tags: testCase.tags || [],
        cases: [{
          title: testCase.title,
          steps: testCase.description?.split('\n') || [],
          expectedResult: testCase.goal || '',
          risk: '',
          tags: testCase.tags || []
        }]
      }]
    },
    testCase: {
      title: testCase.title,
      steps: testCase.description?.split('\n') || [],
      expectedResult: testCase.goal || ''
    },
    baseUrl: environment.baseUrl,
    authConfig: project?.authConfig as Record<string, unknown> | undefined
  })

  await aiCache.set(cacheKey, code, 'codeGeneration')

  await db.update(testCases).set({
    generatedCode: code,
    updatedAt: new Date()
  }).where(eq(testCases.id, testCaseId))

  return NextResponse.json({ code })
}
```

- [ ] **Step 3: Create src/app/api/ai/analyze-failure/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { getDefaultProvider } from '@/services/ai'
import { db } from '@/db'
import { testRunResults, testCases } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: Request) {
  const body = await request.json()
  const { testRunResultId } = body

  const result = await db.query.testRunResults.findFirst({
    where: eq(testRunResults.id, testRunResultId)
  })

  if (!result) {
    return NextResponse.json({ error: 'Test run result not found' }, { status: 404 })
  }

  const testCase = await db.query.testCases.findFirst({
    where: eq(testCases.id, result.testCaseId)
  })

  const provider = getDefaultProvider()
  const analysis = await provider.analyzeFailure({
    testCode: testCase?.generatedCode || '',
    errorMessage: result.errorMessage || '',
    consoleLogs: result.consoleLogs as string[] || [],
    currentUrl: undefined,
    failedStep: undefined
  })

  await db.update(testRunResults).set({
    aiAnalysis: {
      rootCause: analysis.rootCause,
      confidenceScore: analysis.confidenceScore,
      issueType: analysis.issueType,
      suggestedFix: analysis.suggestedFix
    }
  }).where(eq(testRunResults.id, testRunResultId))

  return NextResponse.json(analysis)
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/ai/
git commit -m "feat: add AI API routes for plan generation, code gen, and failure analysis"
```

---

## Task 11: API Routes - Bug Reports

**Files:**
- Create: `src/app/api/bug-reports/route.ts`
- Create: `src/app/api/bug-reports/[id]/route.ts`

**Interfaces:**
- Consumes: Task 2 (database)
- Produces: CRUD APIs for bug reports

- [ ] **Step 1: Create src/app/api/bug-reports/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { bugReports } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { generateId } from '@/lib/utils'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get('projectId')
  const status = searchParams.get('status')

  const conditions = []
  if (projectId) conditions.push(eq(bugReports.projectId, projectId))
  if (status) conditions.push(eq(bugReports.status, status as 'open' | 'in-progress' | 'resolved' | 'closed'))

  const results = await db.query.bugReports.findMany({
    where: conditions.length > 0 ? and(...conditions) : undefined,
    orderBy: [desc(bugReports.createdAt)]
  })

  return NextResponse.json(results)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { projectId, testRunResultId, title, module, environment, stepsToReproduce, expectedResult, actualResult, evidence, aiAnalysis } = body

  const bugReport = await db.insert(bugReports).values({
    id: generateId(),
    projectId,
    testRunResultId,
    title,
    module,
    environment,
    stepsToReproduce,
    expectedResult,
    actualResult,
    evidence,
    aiAnalysis,
    updatedAt: new Date()
  }).returning()

  return NextResponse.json(bugReport[0], { status: 201 })
}
```

- [ ] **Step 2: Create src/app/api/bug-reports/[id]/route.ts**

```typescript
import { NextResponse } from 'next/server'
import { db } from '@/db'
import { bugReports } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const bugReport = await db.query.bugReports.findFirst({
    where: eq(bugReports.id, id)
  })

  if (!bugReport) {
    return NextResponse.json({ error: 'Bug report not found' }, { status: 404 })
  }

  return NextResponse.json(bugReport)
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await request.json()

  const updated = await db.update(bugReports).set({
    ...body,
    updatedAt: new Date()
  }).where(eq(bugReports.id, id)).returning()

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Bug report not found' }, { status: 404 })
  }

  return NextResponse.json(updated[0])
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/bug-reports/
git commit -m "feat: add bug report API routes"
```

---

## Task 12: React Hooks

**Files:**
- Create: `src/hooks/use-projects.ts`
- Create: `src/hooks/use-test-cases.ts`
- Create: `src/hooks/use-test-runs.ts`
- Create: `src/hooks/use-ai.ts`
- Create: `src/hooks/use-bug-reports.ts`

**Interfaces:**
- Consumes: Task 4 (API client)
- Produces: React Query hooks for frontend

- [ ] **Step 1: Create src/hooks/use-projects.ts**

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api-client'

export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list()
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['projects', id],
    queryFn: () => api.projects.get(id),
    enabled: !!id
  })
}

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.projects.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.projects.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] })
    }
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    }
  })
}

export function useProjectEnvironments(projectId: string) {
  return useQuery({
    queryKey: ['projects', projectId, 'environments'],
    queryFn: () => api.environments.list(projectId),
    enabled: !!projectId
  })
}

export function useCreateEnvironment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: unknown }) =>
      api.environments.create(projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId, 'environments'] })
    }
  })
}
```

- [ ] **Step 2: Create src/hooks/use-test-cases.ts**

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api-client'

export function useTestCases(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['testCases', filters],
    queryFn: () => api.testCases.list(filters)
  })
}

export function useTestCase(id: string) {
  return useQuery({
    queryKey: ['testCases', id],
    queryFn: () => api.testCases.get(id),
    enabled: !!id
  })
}

export function useCreateTestCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.testCases.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] })
    }
  })
}

export function useUpdateTestCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.testCases.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] })
      queryClient.invalidateQueries({ queryKey: ['testCases', variables.id] })
    }
  })
}

export function useApproveTestCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.testCases.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] })
    }
  })
}

export function useDisableTestCase() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.testCases.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testCases'] })
    }
  })
}
```

- [ ] **Step 3: Create src/hooks/use-test-runs.ts**

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api-client'

export function useTestRuns(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['testRuns', filters],
    queryFn: () => api.testRuns.list(filters)
  })
}

export function useTestRun(id: string) {
  return useQuery({
    queryKey: ['testRuns', id],
    queryFn: () => api.testRuns.get(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return status === 'running' || status === 'queued' ? 2000 : false
    }
  })
}

export function useCreateTestRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.testRuns.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRuns'] })
    }
  })
}

export function useCancelTestRun() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.testRuns.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testRuns'] })
    }
  })
}
```

- [ ] **Step 4: Create src/hooks/use-ai.ts**

```typescript
'use client'

import { useMutation } from '@tanstack/react-query'
import api from '@/lib/api-client'

export function useGenerateTestPlan() {
  return useMutation({
    mutationFn: (data: unknown) => api.ai.generatePlan(data)
  })
}

export function useGenerateCode() {
  return useMutation({
    mutationFn: (data: unknown) => api.ai.generateCode(data)
  })
}

export function useAnalyzeFailure() {
  return useMutation({
    mutationFn: (data: unknown) => api.ai.analyzeFailure(data)
  })
}
```

- [ ] **Step 5: Create src/hooks/use-bug-reports.ts**

```typescript
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api-client'

export function useBugReports(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['bugReports', filters],
    queryFn: () => api.bugReports.list(filters)
  })
}

export function useBugReport(id: string) {
  return useQuery({
    queryKey: ['bugReports', id],
    queryFn: () => api.bugReports.get(id),
    enabled: !!id
  })
}

export function useCreateBugReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: unknown) => api.bugReports.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugReports'] })
    }
  })
}

export function useUpdateBugReport() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => api.bugReports.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bugReports'] })
      queryClient.invalidateQueries({ queryKey: ['bugReports', variables.id] })
    }
  })
}
```

- [ ] **Step 6: Commit**

```bash
git add src/hooks/
git commit -m "feat: add React Query hooks for all entities"
```

---

## Task 13: UI Components - Layout

**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/providers.tsx`
- Create: `src/app/(dashboard)/layout.tsx`

**Interfaces:**
- Consumes: Task 4 (utils)
- Produces: Dashboard layout with navigation

- [ ] **Step 1: Create src/components/layout/providers.tsx**

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 2: Create src/components/layout/sidebar.tsx**

```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FolderKanban,
  TestTube,
  Play,
  Bug,
  Settings,
  Zap
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Test Cases', href: '/test-cases', icon: TestTube },
  { name: 'Test Runs', href: '/test-runs', icon: Play },
  { name: 'AI Generate', href: '/ai-generate', icon: Zap },
  { name: 'AI Suggestions', href: '/ai-suggestions', icon: Zap },
  { name: 'Bug Reports', href: '/bug-reports', icon: Bug },
  { name: 'Settings', href: '/settings', icon: Settings }
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">AI Regression Worker</h1>
        <p className="text-sm text-gray-400">Testing Platform</p>
      </div>

      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 3: Create src/components/layout/header.tsx**

```tsx
'use client'

import { Bell, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="h-16 border-b bg-white flex items-center justify-between px-6">
      <div />
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <User className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
```

- [ ] **Step 4: Create src/app/(dashboard)/layout.tsx**

```tsx
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create src/app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Regression Worker',
  description: 'AI-powered regression testing platform'
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/ src/app/layout.tsx "src/app/(dashboard)/layout.tsx"
git commit -m "feat: add dashboard layout with sidebar and header"
```

---

## Task 14: UI Components - Dashboard

**Files:**
- Create: `src/components/dashboard/metrics-cards.tsx`
- Create: `src/components/dashboard/pass-fail-chart.tsx`
- Create: `src/components/dashboard/recent-runs.tsx`
- Create: `src/app/(dashboard)/dashboard/page.tsx`

**Interfaces:**
- Consumes: Task 12 (hooks)
- Produces: Dashboard page with metrics

- [ ] **Step 1: Create src/components/dashboard/metrics-cards.tsx**

```tsx
'use client'

import { FolderKanban, TestTube, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetricsCardsProps {
  totalProjects: number
  totalTestCases: number
  passRate: number
  failRate: number
}

export function MetricsCards({ totalProjects, totalTestCases, passRate, failRate }: MetricsCardsProps) {
  const metrics = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: FolderKanban,
      color: 'text-blue-600'
    },
    {
      title: 'Test Cases',
      value: totalTestCases,
      icon: TestTube,
      color: 'text-purple-600'
    },
    {
      title: 'Pass Rate',
      value: `${passRate}%`,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Fail Rate',
      value: `${failRate}%`,
      icon: XCircle,
      color: 'text-red-600'
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {metric.title}
            </CardTitle>
            <metric.icon className={`w-5 h-5 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create src/app/(dashboard)/dashboard/page.tsx**

```tsx
'use client'

import { useProjects } from '@/hooks/use-projects'
import { useTestCases } from '@/hooks/use-test-cases'
import { useTestRuns } from '@/hooks/use-test-runs'
import { MetricsCards } from '@/components/dashboard/metrics-cards'

export default function DashboardPage() {
  const { data: projects } = useProjects()
  const { data: testCases } = useTestCases()
  const { data: testRuns } = useTestRuns()

  const totalProjects = projects?.length || 0
  const totalTestCases = testCases?.length || 0

  const completedRuns = testRuns?.filter(r => r.status === 'passed' || r.status === 'failed') || []
  const passedRuns = completedRuns.filter(r => r.status === 'passed')
  const passRate = completedRuns.length > 0 ? Math.round((passedRuns.length / completedRuns.length) * 100) : 0
  const failRate = 100 - passRate

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">Overview of your testing platform</p>
      </div>

      <MetricsCards
        totalProjects={totalProjects}
        totalTestCases={totalTestCases}
        passRate={passRate}
        failRate={failRate}
      />
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/ "src/app/(dashboard)/dashboard/"
git commit -m "feat: add dashboard page with metrics cards"
```

---

## Task 15: UI Components - Projects

**Files:**
- Create: `src/components/projects/project-form.tsx`
- Create: `src/components/projects/project-card.tsx`
- Create: `src/app/(dashboard)/projects/page.tsx`
- Create: `src/app/(dashboard)/projects/new/page.tsx`
- Create: `src/app/(dashboard)/projects/[id]/page.tsx`

**Interfaces:**
- Consumes: Task 12 (hooks)
- Produces: Project management pages

- [ ] **Step 1: Create src/components/projects/project-card.tsx**

```tsx
'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

interface ProjectCardProps {
  id: string
  name: string
  baseUrl: string
  description?: string
}

export function ProjectCard({ id, name, baseUrl, description }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Link href={baseUrl} target="_blank">
            <Button variant="ghost" size="icon">
              <ExternalLink className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {description || 'No description'}
        </p>
        <p className="text-xs text-gray-500 mb-4">{baseUrl}</p>
        <Link href={`/projects/${id}`}>
          <Button className="w-full">View Project</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Create src/app/(dashboard)/projects/page.tsx**

```tsx
'use client'

import Link from 'next/link'
import { useProjects } from '@/hooks/use-projects'
import { ProjectCard } from '@/components/projects/project-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function ProjectsPage() {
  const { data: projects, isLoading } = useProjects()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-gray-600">Manage your testing projects</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading...</div>
      ) : projects?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No projects yet</p>
          <Link href="/projects/new">
            <Button className="mt-4">Create your first project</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              name={project.name}
              baseUrl={project.baseUrl}
              description={project.description || undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Create src/app/(dashboard)/projects/new/page.tsx**

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useCreateProject } from '@/hooks/use-projects'
import { ProjectForm } from '@/components/projects/project-form'

export default function NewProjectPage() {
  const router = useRouter()
  const createProject = useCreateProject()

  const handleSubmit = async (data: unknown) => {
    await createProject.mutateAsync(data)
    router.push('/projects')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create Project</h1>
      <ProjectForm onSubmit={handleSubmit} isLoading={createProject.isPending} />
    </div>
  )
}
```

- [ ] **Step 4: Create src/components/projects/project-form.tsx**

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  baseUrl: z.string().url('Must be a valid URL'),
  description: z.string().optional()
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>
  onSubmit: (data: ProjectFormData) => Promise<void>
  isLoading?: boolean
}

export function ProjectForm({ initialData, onSubmit, isLoading }: ProjectFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input id="name" {...register('name')} placeholder="My Website" />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseUrl">Base URL</Label>
            <Input id="baseUrl" {...register('baseUrl')} placeholder="https://example.com" />
            {errors.baseUrl && (
              <p className="text-sm text-red-500">{errors.baseUrl.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea id="description" {...register('description')} placeholder="Brief description of the project" />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Project'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/projects/ "src/app/(dashboard)/projects/"
git commit -m "feat: add project management pages"
```

---

## Task 16: AI Generation Wizard

**Files:**
- Create: `src/components/ai/generation-wizard.tsx`
- Create: `src/app/(dashboard)/ai-generate/page.tsx`

**Interfaces:**
- Consumes: Task 12 (hooks)
- Produces: AI test generation page

- [ ] **Step 1: Create src/components/ai/generation-wizard.tsx**

```tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProjects } from '@/hooks/use-projects'
import { useProjectEnvironments } from '@/hooks/use-projects'
import { useGenerateTestPlan, useGenerateCode } from '@/hooks/use-ai'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, CheckCircle } from 'lucide-react'

const wizardSchema = z.object({
  projectId: z.string().min(1, 'Project is required'),
  environmentId: z.string().min(1, 'Environment is required'),
  url: z.string().url('Must be a valid URL'),
  goal: z.string().min(10, 'Goal must be at least 10 characters'),
  role: z.string().optional(),
  destructiveAllowed: z.boolean().default(false)
})

type WizardFormData = z.infer<typeof wizardSchema>

export function GenerationWizard() {
  const [step, setStep] = useState(0)
  const [generatedPlan, setGeneratedPlan] = useState<unknown>(null)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<WizardFormData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: { destructiveAllowed: false }
  })

  const selectedProjectId = watch('projectId')
  const { data: projects } = useProjects()
  const { data: environments } = useProjectEnvironments(selectedProjectId)

  const generatePlan = useGenerateTestPlan()
  const generateCode = useGenerateCode()

  const onSubmit = async (data: WizardFormData) => {
    const result = await generatePlan.mutateAsync(data)
    setGeneratedPlan(result)
    setStep(1)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">AI Test Generation</h1>

      <Tabs value={`step-${step}`}>
        <TabsList>
          <TabsTrigger value="step-0">1. Configure</TabsTrigger>
          <TabsTrigger value="step-1">2. Review Plan</TabsTrigger>
          <TabsTrigger value="step-2">3. Generate Code</TabsTrigger>
        </TabsList>

        <TabsContent value="step-0">
          <Card>
            <CardHeader>
              <CardTitle>Test Generation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project</Label>
                  <select
                    id="projectId"
                    {...register('projectId')}
                    className="w-full border rounded-md p-2"
                  >
                    <option value="">Select a project</option>
                    {projects?.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {errors.projectId && (
                    <p className="text-sm text-red-500">{errors.projectId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environmentId">Environment</Label>
                  <select
                    id="environmentId"
                    {...register('environmentId')}
                    className="w-full border rounded-md p-2"
                    disabled={!selectedProjectId}
                  >
                    <option value="">Select an environment</option>
                    {environments?.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                  {errors.environmentId && (
                    <p className="text-sm text-red-500">{errors.environmentId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">Target URL</Label>
                  <Input id="url" {...register('url')} placeholder="https://example.com/admin" />
                  {errors.url && (
                    <p className="text-sm text-red-500">{errors.url.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal">Testing Goal</Label>
                  <Textarea
                    id="goal"
                    {...register('goal')}
                    placeholder="Test login, create product, edit product, delete product"
                  />
                  {errors.goal && (
                    <p className="text-sm text-red-500">{errors.goal.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">User Role (optional)</Label>
                  <Input id="role" {...register('role')} placeholder="Admin" />
                </div>

                <Button type="submit" disabled={generatePlan.isPending}>
                  {generatePlan.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Plan...
                    </>
                  ) : (
                    'Generate Test Plan'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step-1">
          <Card>
            <CardHeader>
              <CardTitle>Generated Test Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96">
                {JSON.stringify(generatedPlan, null, 2)}
              </pre>
              <div className="mt-4 flex gap-2">
                <Button onClick={() => setStep(0)}>Back</Button>
                <Button onClick={() => setStep(2)}>Continue to Code Generation</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="step-2">
          <Card>
            <CardHeader>
              <CardTitle>Generated Code</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Code generation will appear here</p>
              <div className="mt-4">
                <Button onClick={() => setStep(1)}>Back</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 2: Create src/app/(dashboard)/ai-generate/page.tsx**

```tsx
import { GenerationWizard } from '@/components/ai/generation-wizard'

export default function AIGeneratePage() {
  return <GenerationWizard />
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ai/ "src/app/(dashboard)/ai-generate/"
git commit -m "feat: add AI test generation wizard"
```

---

## Task 17: README & Final Setup

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: All previous tasks
- Produces: Documentation for setup and usage

- [ ] **Step 1: Create README.md**

```markdown
# AI Regression Worker

AI-powered regression testing platform that generates test plans, creates Playwright tests, executes them in background, and analyzes failures with AI.

## Features

- AI Test Plan Generation
- Playwright Code Generation
- Background Test Execution
- Failure Analysis with AI
- Self-Healing Selector Suggestions
- Bug Report Generation

## Tech Stack

- Next.js 16 + React 19
- PostgreSQL + Drizzle ORM
- Redis + BullMQ
- Playwright
- TanStack Query
- shadcn/ui + Tailwind CSS

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- pnpm

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start database services:
   ```bash
   docker-compose up -d
   ```

4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

5. Run database migrations:
   ```bash
   pnpm db:push
   ```

6. Start the development server:
   ```bash
   pnpm dev
   ```

7. Start the worker (in a separate terminal):
   ```bash
   pnpm dev:worker
   ```

## Usage

1. Open http://localhost:3000
2. Create a new project
3. Add environments (dev, staging, production)
4. Use AI Generate to create test plans
5. Review and approve generated test cases
6. Run tests and view results

## Project Structure

See [DESIGN.md](docs/superpowers/specs/2026-06-30-ai-regression-worker-design.md) for detailed architecture.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup instructions"
```

---

## Implementation Complete

The plan covers:
1. Project setup and dependencies
2. Database schema with all entities
3. TypeScript types
4. API client and utilities
5. AI services layer with caching
6. Background worker with BullMQ
7. All API routes (projects, test-cases, test-runs, AI, bug-reports)
8. React Query hooks
9. Dashboard layout and components
10. Project management pages
11. AI generation wizard
12. README documentation

**Next Steps:**
- Choose execution approach (Subagent-Driven or Inline)
- Begin implementation task by task
- Run tests after each task
- Commit frequently
