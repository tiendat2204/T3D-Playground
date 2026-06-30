# AI Regression Worker — Design Specification

## 1. Architecture Overview

Standalone Next.js application with event-driven background processing.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js App                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Dashboard  │  │ Test Cases  │  │ Test Runs   │             │
│  │   Projects   │  │   Manager   │  │   Viewer    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                           │                                     │
│                    ┌──────┴──────┐                              │
│                    │  API Routes  │                              │
│                    └──────┬──────┘                              │
│                           │                                     │
│              ┌────────────┼────────────┐                        │
│              │            │            │                         │
│    ┌─────────▼───────┐  ┌▼────────────┐  ┌▼───────────────┐    │
│    │  Queue Producer  │  │   Redis     │  │  Queue Worker  │    │
│    │  (API Routes)    │──│  (BullMQ)   │──│  (Playwright)  │    │
│    └─────────────────┘  └─────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

**Components:**
- **Next.js App**: UI + API routes + Queue Producer
- **Redis + BullMQ**: Job queue for test execution
- **Background Worker**: Separate Node.js process running Playwright tests
- **AI Services**: Multi-provider abstraction (OpenAI, Anthropic, Gemini, Local)

---

## 2. Tech Stack

### Frontend
- Next.js 16 (App Router)
- React 19
- TypeScript
- TanStack Query v5
- TanStack Table
- shadcn/ui (radix-lyra style)
- Tailwind CSS v4
- Lucide icons
- Monaco Editor (code editing)
- Recharts (dashboard charts)

### Backend
- Next.js API Routes
- Drizzle ORM (PostgreSQL)
- better-auth
- BullMQ (job queue)
- Redis (queue + cache)

### AI
- Multi-provider abstraction
- OpenAI (gpt-4o, gpt-4o-mini)
- Anthropic (claude-3.5-sonnet, claude-3-haiku)
- Gemini (gemini-1.5-pro, gemini-1.5-flash)
- Local models (Ollama, LMStudio)

### Testing
- Playwright (test execution)
- Node.js test runner (unit tests)

---

## 3. Database Schema

Following TA-Nature patterns with PostgreSQL + Drizzle ORM.

### Core Tables

```typescript
// Projects
projects {
  id: text (PK)
  name: text
  baseUrl: text
  description: text
  authConfig: jsonb (credentials, test accounts)
  createdAt: timestamp
  updatedAt: timestamp
}

// Environments
environments {
  id: text (PK)
  projectId: text (FK → projects)
  name: text (dev/staging/production)
  baseUrl: text
  variables: jsonb (env vars)
  createdAt: timestamp
  updatedAt: timestamp
}

// Modules
modules {
  id: text (PK)
  projectId: text (FK → projects)
  name: text
  routePattern: text
  apiPatterns: jsonb
  createdAt: timestamp
  updatedAt: timestamp
}

// Test Cases
testCases {
  id: text (PK)
  projectId: text (FK → projects)
  moduleId: text (FK → modules, nullable)
  title: text
  description: text
  goal: text
  tags: jsonb (string array)
  priority: enum (high/medium/low)
  status: enum (draft/approved/disabled)
  generatedCode: text (Playwright TypeScript)
  createdByAi: boolean
  createdAt: timestamp
  updatedAt: timestamp
}

// Test Runs
testRuns {
  id: text (PK)
  projectId: text (FK → projects)
  environmentId: text (FK → environments)
  status: enum (queued/running/passed/failed/cancelled)
  runType: enum (smoke/regression/impacted/manual)
  tags: jsonb (filter tags)
  startedAt: timestamp
  finishedAt: timestamp
  summary: jsonb (pass/fail counts)
  createdAt: timestamp
}

// Test Run Results
testRunResults {
  id: text (PK)
  testRunId: text (FK → testRuns)
  testCaseId: text (FK → testCases)
  status: enum (passed/failed/skipped/error)
  duration: integer (ms)
  errorMessage: text
  screenshotUrl: text
  videoUrl: text
  traceUrl: text
  consoleLogs: jsonb
  networkLogs: jsonb
  aiAnalysis: jsonb
  createdAt: timestamp
}

// AI Suggestions
aiSuggestions {
  id: text (PK)
  testCaseId: text (FK → testCases)
  testRunResultId: text (FK → testRunResults, nullable)
  suggestionType: enum (patch/bug-report/new-test)
  oldCode: text
  newCode: text
  explanation: text
  confidenceScore: real
  status: enum (pending/approved/rejected)
  createdAt: timestamp
  updatedAt: timestamp
}

// Bug Reports
bugReports {
  id: text (PK)
  projectId: text (FK → projects)
  testRunResultId: text (FK → testRunResults)
  title: text
  module: text
  environment: text
  stepsToReproduce: jsonb (string array)
  expectedResult: text
  actualResult: text
  evidence: jsonb (urls to screenshots/videos/traces)
  aiAnalysis: text
  status: enum (open/in-progress/resolved/closed)
  createdAt: timestamp
  updatedAt: timestamp
}

// Prompt Templates
promptTemplates {
  id: text (PK)
  name: text
  provider: text (or 'all')
  systemPrompt: text
  userPromptTemplate: text
  variables: jsonb (string array)
  isDefault: boolean
  createdAt: timestamp
  updatedAt: timestamp
}
```

---

## 4. API Routes

REST endpoints following TA-Nature patterns.

### Projects
- `GET /api/projects` — List all projects
- `POST /api/projects` — Create project
- `GET /api/projects/[id]` — Get project detail
- `PUT /api/projects/[id]` — Update project
- `DELETE /api/projects/[id]` — Delete project

### Environments
- `GET /api/projects/[id]/environments` — List environments
- `POST /api/projects/[id]/environments` — Add environment
- `PUT /api/environments/[id]` — Update environment
- `DELETE /api/environments/[id]` — Delete environment

### Modules
- `GET /api/projects/[id]/modules` — List modules
- `POST /api/projects/[id]/modules` — Add module

### Test Cases
- `GET /api/test-cases` — List (filter by project/module/tag/status)
- `POST /api/test-cases` — Create test case
- `PUT /api/test-cases/[id]` — Update test case
- `POST /api/test-cases/[id]/approve` — Approve test case
- `POST /api/test-cases/[id]/disable` — Disable test case

### Test Runs
- `POST /api/test-runs` — Trigger new test run
- `GET /api/test-runs` — List runs (filter by project/status)
- `GET /api/test-runs/[id]` — Run detail with results
- `POST /api/test-runs/[id]/cancel` — Cancel running test

### AI Services
- `POST /api/ai/generate-plan` — Generate test plan from requirement
- `POST /api/ai/generate-code` — Generate Playwright code from test plan
- `POST /api/ai/analyze-failure` — Analyze failed test run
- `POST /api/ai/suggest-patch` — Self-healing selector suggestion

### Bug Reports
- `GET /api/bug-reports` — List bug reports
- `POST /api/bug-reports` — Create bug report
- `PUT /api/bug-reports/[id]` — Update bug report status

### Prompt Templates
- `GET /api/prompt-templates` — List templates
- `POST /api/prompt-templates` — Create template
- `PUT /api/prompt-templates/[id]` — Update template
- `DELETE /api/prompt-templates/[id]` — Delete template

---

## 5. Background Worker

Standalone Node.js process consuming BullMQ jobs from Redis.

### Job Types
- `run-test-case` — Execute single test case
- `run-test-suite` — Execute multiple test cases with tags
- `run-smoke` — Run smoke tests only
- `run-regression` — Full regression suite
- `run-impacted` — Run tests affected by code changes

### Worker Flow
1. Receive job from Redis queue
2. Prepare environment variables
3. Write generated test file to temp directory
4. Execute `npx playwright test`
5. Capture screenshots, videos, traces
6. Collect console and network logs
7. Save results to database
8. Upload artifacts to storage (S3/MinIO)
9. Trigger AI analysis on failure
10. Emit status update via Redis pub/sub

### Commands
```bash
pnpm dev:worker    # Development
node dist/worker/index.js  # Production
```

---

## 6. AI Services

Multi-provider abstraction with streaming, caching, and custom prompts.

### Provider Interface
```typescript
interface AIProvider {
  generateTestPlan(params: TestPlanParams): Promise<TestPlan>
  generatePlaywrightCode(params: CodeGenParams): Promise<string>
  analyzeFailure(params: FailureAnalysisParams): Promise<FailureAnalysis>
  suggestPatch(params: PatchParams): Promise<PatchSuggestion>
  streamTestPlan(params: TestPlanParams): AsyncIterable<TestPlanChunk>
  streamCodeGeneration(params: CodeGenParams): AsyncIterable<CodeChunk>
}
```

### Providers
- OpenAI (gpt-4o, gpt-4o-mini)
- Anthropic (claude-3.5-sonnet, claude-3-haiku)
- Gemini (gemini-1.5-pro, gemini-1.5-flash)
- Local (Ollama, LMStudio)

### Caching
- Redis-backed with configurable TTL per task type
- Test plans cached for 24 hours
- Code generation cached for 7 days
- Invalidation on prompt template changes

### Custom Prompts
- DB-stored templates editable per project
- Variable interpolation (URL, goal, role, credentials)
- Provider-specific optimization
- Version history for prompt evolution

---

## 7. Frontend Pages

### Pages Structure
```
/dashboard                          — Overview metrics
/projects                           — List all projects
/projects/[id]                      — Project detail (tabs)
/projects/[id]/environments         — Environment management
/projects/[id]/modules              — Module management
/projects/[id]/test-cases           — Test case list
/projects/[id]/test-runs            — Test run history
/ai-generate                        — AI test generation wizard
/test-cases                         — Global test case search
/test-cases/[id]                    — Test case detail + code
/test-runs                          — Global test run history
/test-runs/[id]                     — Run detail + results
/test-runs/[id]/results/[resultId]  — Failed test analysis
/ai-suggestions                     — AI suggestion queue
/bug-reports                        — Bug report list
/bug-reports/[id]                   — Bug report detail
/settings                           — Global settings (AI providers, prompts)
```

### Key UI Components
- Dashboard with pass/fail charts, recent runs, release readiness
- Project detail with tabbed navigation
- Test case viewer with syntax-highlighted Playwright code
- Test run detail with screenshot/video/trace viewers
- AI suggestion diff viewer (old vs new code)
- Bug report template with evidence attachments
- Monaco Editor for code editing
- Streaming progress indicators for AI generation

---

## 8. MVP Phases

### Phase 1: Project + AI Test Plan
- Create project with environments
- Input URL + requirement
- AI generate test plan
- Save test plan as test cases

### Phase 2: Generate Playwright Code
- Generate Playwright code from test plan
- Preview code with syntax highlighting
- Edit code manually
- Save as draft → Approve

### Phase 3: Run Test
- Queue test run via BullMQ
- Execute Playwright tests in background
- Save results with screenshots/videos/traces
- Display pass/fail status

### Phase 4: AI Failure Analysis
- Analyze failed tests with AI
- Show root cause + confidence score
- Suggest patches for self-healing
- Generate bug reports with evidence

---

## 9. Project Structure

```
T3D-Playground/
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── projects/
│   │   │   ├── test-cases/
│   │   │   ├── test-runs/
│   │   │   ├── ai-generate/
│   │   │   ├── ai-suggestions/
│   │   │   ├── bug-reports/
│   │   │   └── settings/
│   │   ├── api/
│   │   │   ├── projects/
│   │   │   ├── test-cases/
│   │   │   ├── test-runs/
│   │   │   ├── ai/
│   │   │   ├── bug-reports/
│   │   │   └── prompt-templates/
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/ (shadcn)
│   │   ├── layout/
│   │   ├── projects/
│   │   ├── test-cases/
│   │   ├── test-runs/
│   │   ├── ai/
│   │   ├── dashboard/
│   │   └── bug-reports/
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── hooks/
│   │   ├── use-projects.ts
│   │   ├── use-test-cases.ts
│   │   ├── use-test-runs.ts
│   │   └── use-ai.ts
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
│   │   │   └── index.ts
│   │   ├── projects.service.ts
│   │   ├── test-cases.service.ts
│   │   ├── test-runs.service.ts
│   │   └── bug-reports.service.ts
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
├── docker-compose.yml (Redis, PostgreSQL)
├── drizzle.config.ts
├── package.json
└── README.md
```

---

## 10. Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://localhost:6379

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Local AI (optional)
OLLAMA_BASE_URL=http://localhost:11434

# Storage (S3/MinIO)
S3_BUCKET=ai-regression-worker
S3_REGION=us-east-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_ENDPOINT=... (for MinIO)

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 11. Key Design Decisions

1. **Standalone App**: Simple deployment, shared code, fast iteration
2. **Event-Driven**: Non-blocking test execution, better scalability
3. **Multi-Provider AI**: Flexibility, cost optimization, fallback support
4. **Redis Caching**: Reduce API costs, faster repeated queries
5. **Custom Prompts**: Per-project customization, prompt evolution
6. **Drizzle ORM**: Consistent with TA-Nature, type-safe queries
7. **BullMQ**: Robust job queue with retries, priorities, rate limiting

---

## 12. Success Criteria

- Create project and configure environments
- Generate test plans from requirements via AI
- Generate Playwright code from test plans
- Execute tests in background worker
- Capture screenshots, videos, traces on failure
- Analyze failures with AI and suggest patches
- Generate bug reports with evidence
- Support self-healing selector updates (with approval)
- Dashboard showing pass/fail metrics and release readiness
