# AI Regression Worker Improvements Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enhance the AI Regression Worker with code generation wizard, UI consistency, and improved filtering across pages.

**Architecture:** Update existing React components to use Tailwind CSS utilities, add filtering functionality to dashboard pages, and implement Playwright code generation in the AI wizard.

**Tech Stack:** React, TypeScript, Tailwind CSS, Radix UI, Lucide icons, Tanstack React Query

## Global Constraints

- Use `rounded-none` for all UI components except badges (keep `rounded-full`)
- All new features must be TypeScript compatible
- Follow existing code patterns and conventions
- Run `pnpm build` after all changes to verify no errors

---

## Task 1: Update UI Components to use rounded-none

**Files:**
- Modify: `/Users/admin/WebstormProjects/T3D-Playground/src/components/ui/input.tsx`
- Modify: `/Users/admin/WebstormProjects/T3D-Playground/src/components/ui/textarea.tsx`
- Modify: `/Users/admin/WebstormProjects/T3D-Playground/src/components/ui/card.tsx`
- Modify: `/Users/admin/WebstormProjects/T3D-Playground/src/components/ui/select.tsx`
- Verify: `/Users/admin/WebstormProjects/T3D-Playground/src/components/ui/badge.tsx` (keep rounded-full)

- [ ] **Step 1: Update Input component**

Change `rounded-md` to `rounded-none` in `/Users/admin/WebstormProjects/T3D-Playground/src/components/ui/input.tsx`:

```typescript
// Line 12: Change rounded-md to rounded-none
className={cn(
  "flex h-9 w-full rounded-none border border-gray-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50",
  className
)}
```

- [ ] **Step 2: Update Textarea component**

Change `rounded-md` to `rounded-none` in `/Users/admin/WebstormProjects/T3D-Playground/src/components/ui/textarea.tsx`:

```typescript
// Line 11: Change rounded-md to rounded-none
className={cn(
  "flex min-h-[60px] w-full rounded-none border border-gray-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50",
  className
)}
```

- [ ] **Step 3: Update Card component**

Change `rounded-lg` to `rounded-none` in `/Users/admin/WebstormProjects/T3D-Playground/src/components/ui/card.tsx`:

```typescript
// Line 6: Change rounded-lg to rounded-none
<div ref={ref} className={cn("rounded-none border bg-white text-gray-950 shadow-sm", className)} {...props} />
```

- [ ] **Step 4: Update SelectTrigger component**

Change `rounded-md` to `rounded-none` in `/Users/admin/WebstormProjects/T3D-Playground/src/components/ui/select.tsx`:

```typescript
// Line 40: Change rounded-md to rounded-none
className={cn(
  "flex w-fit items-center justify-between gap-2 rounded-none border border-input bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground",
  className
)}
```

Also update SelectContent:

```typescript
// Line 65: Change rounded-md to rounded-none
className={cn(
  "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-none border bg-popover text-popover-foreground shadow-md data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
  className
)}
```

- [ ] **Step 5: Verify Badge component**

Badge should keep `rounded-full` - no changes needed.

- [ ] **Step 6: Run build to verify**

```bash
pnpm build
```

Expected: Build succeeds with no TypeScript errors.

---

## Task 2: Implement Playwright Code Generation in Wizard Step 2

**Files:**
- Modify: `/Users/admin/WebstormProjects/T3D-Playground/src/components/ai/generation-wizard.tsx`

**Interfaces:**
- Consumes: `testPlan` state (from Step 1), `environmentId` state, `useGenerateCode` hook
- Produces: Generated Playwright code display

- [ ] **Step 1: Add state variables for code generation**

Add these state variables to the GenerationWizard component:

```typescript
const [selectedTestCaseIndex, setSelectedTestCaseIndex] = React.useState<{suiteIndex: number; caseIndex: number} | null>(null)
const [generatedCode, setGeneratedCode] = React.useState<string | null>(null)
const [isGeneratingCode, setIsGeneratingCode] = React.useState(false)
const [copiedToClipboard, setCopiedToClipboard] = React.useState(false)
const generateCodeMutation = useGenerateCode()
```

Add the import for `useGenerateCode`:

```typescript
import { useGenerateCode } from '@/hooks/use-ai'
```

Add import for clipboard icon:

```typescript
import { Loader2, Sparkles, ArrowLeft, ArrowRight, Check, Copy, CheckCheck } from 'lucide-react'
```

- [ ] **Step 2: Add code generation handler**

Add this function to handle code generation:

```typescript
const handleGenerateCode = async () => {
  if (!selectedTestCaseIndex || !environmentId) {
    toast.error('Please select a test case and environment')
    return
  }

  setIsGeneratingCode(true)
  setGeneratedCode(null)

  try {
    const testCase = testPlan?.testSuites[selectedTestCaseIndex.suiteIndex]?.cases[selectedTestCaseIndex.caseIndex]
    if (!testCase) {
      toast.error('Invalid test case selection')
      return
    }

    const result = await generateCodeMutation.mutateAsync({
      testCaseId: `${selectedTestCaseIndex.suiteIndex}-${selectedTestCaseIndex.caseIndex}`,
      environmentId
    })

    if (result) {
      setGeneratedCode(result)
      toast.success('Code generated successfully!')
    } else {
      toast.error('Failed to generate code')
    }
  } catch (error) {
    toast.error('Failed to generate code. Please try again.')
  } finally {
    setIsGeneratingCode(false)
  }
}
```

- [ ] **Step 3: Add copy to clipboard handler**

```typescript
const handleCopyToClipboard = async () => {
  if (!generatedCode) return

  try {
    await navigator.clipboard.writeText(generatedCode)
    setCopiedToClipboard(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopiedToClipboard(false), 2000)
  } catch (error) {
    toast.error('Failed to copy to clipboard')
  }
}
```

- [ ] **Step 4: Update Step 2 UI with test case selection and code generation**

Replace the Step 2 content with:

```tsx
{/* Step 2: Code Generation */}
{step === 2 && testPlan && (
  <Card>
    <CardHeader>
      <CardTitle>Generate Playwright Code</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Select Test Case *</Label>
          <Select
            value={selectedTestCaseIndex ? `${selectedTestCaseIndex.suiteIndex}-${selectedTestCaseIndex.caseIndex}` : ''}
            onValueChange={(value) => {
              const [suiteIdx, caseIdx] = value.split('-').map(Number)
              setSelectedTestCaseIndex({ suiteIndex: suiteIdx, caseIndex: caseIdx })
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a test case to generate code for" />
            </SelectTrigger>
            <SelectContent>
              {testPlan.testSuites.map((suite, suiteIdx) =>
                suite.cases.map((testCase, caseIdx) => (
                  <SelectItem key={`${suiteIdx}-${caseIdx}`} value={`${suiteIdx}-${caseIdx}`}>
                    {suite.name}: {testCase.title}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleGenerateCode}
          disabled={isGeneratingCode || !selectedTestCaseIndex || !environmentId}
        >
          {isGeneratingCode ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Code...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Code
            </>
          )}
        </Button>

        {generatedCode && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Generated Playwright Code</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyToClipboard}
                className="flex items-center gap-2"
              >
                {copiedToClipboard ? (
                  <>
                    <CheckCheck className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-none overflow-x-auto text-sm font-mono">
              <code>{generatedCode}</code>
            </pre>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={() => setStep(1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    </CardContent>
  </Card>
)}
```

- [ ] **Step 5: Run build to verify**

```bash
pnpm build
```

Expected: Build succeeds with no TypeScript errors.

---

## Task 3: Improve Test Cases Page with Filtering

**Files:**
- Modify: `/Users/admin/WebstormProjects/T3D-Playground/src/app/(dashboard)/test-cases/page.tsx`

**Interfaces:**
- Consumes: `useTestCases` hook
- Produces: Filtered test cases list with search, status filter, tag filter

- [ ] **Step 1: Add imports**

```typescript
import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Search, Edit, Trash2 } from 'lucide-react'
```

- [ ] **Step 2: Add filter state variables**

```typescript
const [searchQuery, setSearchQuery] = useState('')
const [statusFilter, setStatusFilter] = useState<string>('all')
const [tagFilter, setTagFilter] = useState<string>('all')
```

- [ ] **Step 3: Compute unique tags from test cases**

```typescript
const allTags = useMemo(() => {
  if (!testCases) return []
  const tags = new Set<string>()
  testCases.forEach(tc => {
    tc.tags?.forEach(tag => tags.add(tag))
  })
  return Array.from(tags)
}, [testCases])
```

- [ ] **Step 4: Compute filtered test cases**

```typescript
const filteredTestCases = useMemo(() => {
  if (!testCases) return []

  return testCases.filter(tc => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesTitle = tc.title.toLowerCase().includes(query)
      const matchesDescription = tc.description?.toLowerCase().includes(query)
      if (!matchesTitle && !matchesDescription) return false
    }

    // Status filter
    if (statusFilter !== 'all' && tc.status !== statusFilter) return false

    // Tag filter
    if (tagFilter !== 'all' && !tc.tags?.includes(tagFilter)) return false

    return true
  })
}, [testCases, searchQuery, statusFilter, tagFilter])
```

- [ ] **Step 5: Add filter UI before the list**

Add this after the header div:

```tsx
<div className="flex flex-wrap gap-4">
  <div className="relative flex-1 min-w-[200px]">
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
    <Input
      placeholder="Search test cases..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="pl-9"
    />
  </div>

  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-[150px]">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Status</SelectItem>
      <SelectItem value="draft">Draft</SelectItem>
      <SelectItem value="approved">Approved</SelectItem>
      <SelectItem value="disabled">Disabled</SelectItem>
    </SelectContent>
  </Select>

  {allTags.length > 0 && (
    <Select value={tagFilter} onValueChange={setTagFilter}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Tag" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Tags</SelectItem>
        {allTags.map(tag => (
          <SelectItem key={tag} value={tag}>{tag}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
</div>
```

- [ ] **Step 6: Update list to use filteredTestCases and add actions**

Replace the test cases list with:

```tsx
<div className="grid gap-4">
  {filteredTestCases.map((tc) => (
    <Card key={tc.id}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{tc.title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={tc.status === 'approved' ? 'default' : tc.status === 'draft' ? 'secondary' : 'outline'}>
              {tc.status}
            </Badge>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{tc.description || 'No description'}</p>
        <div className="flex gap-2 mt-3">
          {tc.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

- [ ] **Step 7: Replace raw button with project Button component**

Replace the raw button in the header:

```tsx
<Link href="/ai-generate">
  <Button>
    <Plus className="w-4 h-4 mr-2" />
    Generate Test Case
  </Button>
</Link>
```

- [ ] **Step 8: Run build to verify**

```bash
pnpm build
```

Expected: Build succeeds with no TypeScript errors.

---

## Task 4: Improve Test Runs Page with Status Filter and Duration

**Files:**
- Modify: `/Users/admin/WebstormProjects/T3D-Playground/src/app/(dashboard)/test-runs/page.tsx`

**Interfaces:**
- Consumes: `useTestRuns` hook
- Produces: Filtered test runs with duration display

- [ ] **Step 1: Add imports**

```typescript
import { useState, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Timer } from 'lucide-react'
```

- [ ] **Step 2: Add filter state**

```typescript
const [statusFilter, setStatusFilter] = useState<string>('all')
```

- [ ] **Step 3: Add duration formatting helper**

```typescript
const formatDuration = (startTime: string, endTime?: string) => {
  const start = new Date(startTime).getTime()
  const end = endTime ? new Date(endTime).getTime() : Date.now()
  const durationMs = end - start

  if (durationMs < 1000) return `${durationMs}ms`
  if (durationMs < 60000) return `${(durationMs / 1000).toFixed(1)}s`
  const minutes = Math.floor(durationMs / 60000)
  const seconds = Math.floor((durationMs % 60000) / 1000)
  return `${minutes}m ${seconds}s`
}
```

- [ ] **Step 4: Compute filtered test runs**

```typescript
const filteredTestRuns = useMemo(() => {
  if (!testRuns) return []

  return testRuns.filter(run => {
    if (statusFilter !== 'all' && run.status !== statusFilter) return false
    return true
  })
}, [testRuns, statusFilter])
```

- [ ] **Step 5: Add filter UI after header**

```tsx
<div className="flex items-center gap-4">
  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-[150px]">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Status</SelectItem>
      <SelectItem value="running">Running</SelectItem>
      <SelectItem value="passed">Passed</SelectItem>
      <SelectItem value="failed">Failed</SelectItem>
    </SelectContent>
  </Select>
</div>
```

- [ ] **Step 6: Update list to use filteredTestRuns and add duration**

Replace the test runs list with:

```tsx
<div className="grid gap-4">
  {filteredTestRuns.map((run) => (
    <Card key={run.id}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon(run.status)}
            Test Run
          </CardTitle>
          <Badge variant={run.status === 'passed' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}>
            {run.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Type: {run.runType}</span>
          <span>Created: {new Date(run.createdAt).toLocaleDateString()}</span>
          {run.completedAt && (
            <span className="flex items-center gap-1">
              <Timer className="w-4 h-4" />
              Duration: {formatDuration(run.createdAt, run.completedAt)}
            </span>
          )}
          {run.summary && (
            <span>
              Results: {run.summary.passed}/{run.summary.total} passed
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

- [ ] **Step 7: Run build to verify**

```bash
pnpm build
```

Expected: Build succeeds with no TypeScript errors.

---

## Task 5: Improve Bug Reports Page with Filters

**Files:**
- Modify: `/Users/admin/WebstormProjects/T3D-Playground/src/app/(dashboard)/bug-reports/page.tsx`

**Interfaces:**
- Consumes: `useBugReports` hook
- Produces: Filtered bug reports with status and module filters

- [ ] **Step 1: Add imports**

```typescript
import { useState, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
```

- [ ] **Step 2: Add filter state**

```typescript
const [statusFilter, setStatusFilter] = useState<string>('all')
const [moduleFilter, setModuleFilter] = useState<string>('all')
```

- [ ] **Step 3: Compute unique modules**

```typescript
const allModules = useMemo(() => {
  if (!bugReports) return []
  const modules = new Set<string>()
  bugReports.forEach(bug => {
    if (bug.module) modules.add(bug.module)
  })
  return Array.from(modules)
}, [bugReports])
```

- [ ] **Step 4: Compute filtered bug reports**

```typescript
const filteredBugReports = useMemo(() => {
  if (!bugReports) return []

  return bugReports.filter(bug => {
    if (statusFilter !== 'all' && bug.status !== statusFilter) return false
    if (moduleFilter !== 'all' && bug.module !== moduleFilter) return false
    return true
  })
}, [bugReports, statusFilter, moduleFilter])
```

- [ ] **Step 5: Add filter UI after header**

```tsx
<div className="flex items-center gap-4">
  <Select value={statusFilter} onValueChange={setStatusFilter}>
    <SelectTrigger className="w-[150px]">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Status</SelectItem>
      <SelectItem value="open">Open</SelectItem>
      <SelectItem value="in-progress">In Progress</SelectItem>
      <SelectItem value="resolved">Resolved</SelectItem>
    </SelectContent>
  </Select>

  {allModules.length > 0 && (
    <Select value={moduleFilter} onValueChange={setModuleFilter}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Module" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Modules</SelectItem>
        {allModules.map(mod => (
          <SelectItem key={mod} value={mod}>{mod}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
</div>
```

- [ ] **Step 6: Update list to use filteredBugReports**

Replace the bug reports list with:

```tsx
<div className="grid gap-4">
  {filteredBugReports.map((bug) => (
    <Card key={bug.id}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            {bug.title}
          </CardTitle>
          <Badge variant={getStatusColor(bug.status)}>
            {bug.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{bug.actualResult}</p>
        <div className="flex gap-4 mt-3 text-sm text-gray-500">
          {bug.module && <span>Module: {bug.module}</span>}
          {bug.environment && <span>Env: {bug.environment}</span>}
          <span>Created: {new Date(bug.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  ))}
</div>
```

- [ ] **Step 7: Run build to verify**

```bash
pnpm build
```

Expected: Build succeeds with no TypeScript errors.

---

## Verification Checklist

After completing all tasks:

1. Run `pnpm build` to verify no TypeScript errors
2. Check that all UI components use `rounded-none` (except badges)
3. Verify code generation wizard works with test case selection
4. Verify filtering works on test cases, test runs, and bug reports pages
5. Verify copy to clipboard functionality works
