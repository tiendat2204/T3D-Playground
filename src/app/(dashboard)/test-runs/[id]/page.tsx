'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { useTestRun, useCreateTestRun, useCancelTestRun } from '@/hooks/use-test-runs'
import { useAnalyzeFailure } from '@/hooks/use-ai'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, Loader2, CheckCircle, XCircle, Clock, AlertCircle, Brain, X, ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatDuration } from '@/lib/utils'

interface AiAnalysis {
  rootCause: string
  confidenceScore: number
  issueType: string
  suggestedFix: string
}

interface TestRunResult {
  id: string
  testCaseId: string
  status: 'passed' | 'failed' | 'skipped' | 'error'
  duration: number | null
  errorMessage: string | null
  consoleLogs?: string[] | null
  aiAnalysis?: AiAnalysis | null
  testCase?: {
    title: string
    tags: string[]
  }
}

interface TestRunData {
  id: string
  projectId: string
  environmentId: string
  status: string
  runType: string
  tags: string[] | null
  startedAt: string | null
  finishedAt: string | null
  summary: {
    total: number
    passed: number
    failed: number
    skipped: number
    error: number
  } | null
  createdAt: string
  results?: TestRunResult[]
  environment?: {
    name: string
    baseUrl: string
  }
}

export default function TestRunDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { data: testRun, isLoading } = useTestRun(id)
  const createTestRun = useCreateTestRun()
  const cancelTestRun = useCancelTestRun()
  const analyzeFailure = useAnalyzeFailure()
  const [expandedConsoleLogs, setExpandedConsoleLogs] = useState<Record<string, boolean>>({})

  const run = testRun as TestRunData | null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case 'error': return <AlertCircle className="w-4 h-4 text-orange-500" />
      default: return <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
    }
  }

  const getResultStatusVariant = (status: string) => {
    switch (status) {
      case 'passed': return 'default' as const
      case 'failed': return 'destructive' as const
      case 'error': return 'destructive' as const
      case 'skipped': return 'secondary' as const
      default: return 'outline' as const
    }
  }

  const handleAnalyzeFailure = async (resultId: string) => {
    try {
      const analysis = await analyzeFailure.mutateAsync({ testRunResultId: resultId })
      if (analysis) {
        toast.success('Failure analyzed successfully')
      } else {
        toast.error('Analysis returned no results')
      }
    } catch {
      toast.error('Failed to analyze failure')
    }
  }

  const handleRerunFailed = async () => {
    if (!run) return

    const failedResults = run.results?.filter(r => r.status === 'failed' || r.status === 'error') || []
    if (failedResults.length === 0) {
      toast.error('No failed tests to re-run')
      return
    }

    try {
      const result = await createTestRun.mutateAsync({
        projectId: run.projectId,
        environmentId: run.environmentId,
        runType: 'manual',
        testCaseIds: failedResults.map(r => r.testCaseId)
      })

      if (result) {
        toast.success('Re-run created')
        router.push(`/test-runs/${result.id}`)
      }
    } catch {
      toast.error('Failed to create re-run')
    }
  }

  const handleCancelRun = async () => {
    if (!run) return
    try {
      await cancelTestRun.mutateAsync(run.id)
      toast.success('Test run cancelled')
    } catch {
      toast.error('Failed to cancel test run')
    }
  }

  const toggleConsoleLogs = (resultId: string) => {
    setExpandedConsoleLogs(prev => ({ ...prev, [resultId]: !prev[resultId] }))
  }

  if (isLoading) {
    return <div className="text-center py-8 dark:text-gray-300">Loading...</div>
  }

  if (!run) {
    return <div className="text-center py-8 dark:text-gray-300">Test run not found</div>
  }

  const failedCount = run.results?.filter(r => r.status === 'failed' || r.status === 'error').length || 0
  const isRunning = run.status === 'running' || run.status === 'queued'

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/test-runs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {getStatusIcon(run.status)}
            Test Run
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Created {formatDate(run.createdAt)}</p>
        </div>
        <Badge variant={run.status === 'passed' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}>
          {run.status}
        </Badge>
        {isRunning && (
          <Button variant="destructive" onClick={handleCancelRun} disabled={cancelTestRun.isPending}>
            <X className="w-4 h-4 mr-2" />
            Cancel Run
          </Button>
        )}
        {failedCount > 0 && !isRunning && (
          <Button onClick={handleRerunFailed} disabled={createTestRun.isPending}>
            {createTestRun.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Re-run Failed ({failedCount})
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{run.summary?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">Passed</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{run.summary?.passed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Failed</CardTitle>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{run.summary?.failed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Duration</CardTitle>
            <Clock className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {run.finishedAt && run.startedAt
                ? formatDuration(new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime())
                : run.status === 'running' ? 'In progress...' : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Run Type:</span>
              <span className="font-medium">{run.runType}</span>
            </div>
            {run.environment && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Environment:</span>
                <span className="font-medium">{run.environment.name}</span>
              </div>
            )}
            {run.tags && run.tags.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tags:</span>
                <div className="flex gap-1">
                  {run.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            {run.startedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Started:</span>
                <span className="font-medium">{formatDate(run.startedAt)}</span>
              </div>
            )}
            {run.finishedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Finished:</span>
                <span className="font-medium">{formatDate(run.finishedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Test Results</CardTitle>
        </CardHeader>
        <CardContent>
          {!run.results || run.results.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {run.status === 'running' ? 'Tests are running...' : 'No results available'}
            </div>
          ) : (
            <div className="space-y-3">
              {run.results.map((result: TestRunResult) => {
                const isFailed = result.status === 'failed' || result.status === 'error'
                const hasAnalysis = !!result.aiAnalysis
                const hasConsoleLogs = result.consoleLogs && result.consoleLogs.length > 0
                const logsExpanded = expandedConsoleLogs[result.id] || false

                return (
                  <div
                    key={result.id}
                    className="flex items-start gap-4 p-4 border rounded-lg dark:border-gray-700"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(result.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {result.testCase?.title || 'Unknown Test'}
                        </span>
                        <Badge variant={getResultStatusVariant(result.status)}>
                          {result.status}
                        </Badge>
                      </div>
                      {result.testCase?.tags && result.testCase.tags.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {result.testCase.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      )}
                      {result.errorMessage && (
                        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
                          {result.errorMessage}
                        </div>
                      )}

                      {hasAnalysis && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-blue-800 dark:text-blue-300">AI Analysis</span>
                            {result.aiAnalysis!.confidenceScore != null && (
                              <Badge variant="outline" className="text-xs ml-auto">
                                {Math.round(result.aiAnalysis!.confidenceScore * 100)}% confidence
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="font-medium text-blue-800 dark:text-blue-300">Root Cause:</span>
                              <p className="text-blue-700 dark:text-blue-400 mt-1">{result.aiAnalysis!.rootCause}</p>
                            </div>
                            {result.aiAnalysis!.suggestedFix && (
                              <div>
                                <span className="font-medium text-blue-800 dark:text-blue-300">Suggested Fix:</span>
                                <p className="text-blue-700 dark:text-blue-400 mt-1">{result.aiAnalysis!.suggestedFix}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {hasConsoleLogs && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleConsoleLogs(result.id)}
                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          >
                            <FileText className="w-3 h-3" />
                            Console Logs ({result.consoleLogs!.length})
                            {logsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                          {logsExpanded && (
                            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 border rounded text-xs font-mono max-h-40 overflow-y-auto">
                              {result.consoleLogs!.map((log, i) => (
                                <div key={i} className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{log}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {isFailed && !hasAnalysis && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleAnalyzeFailure(result.id)}
                          disabled={analyzeFailure.isPending}
                        >
                          {analyzeFailure.isPending ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Brain className="w-4 h-4 mr-1" />
                          )}
                          Analyze Failure
                        </Button>
                      )}
                    </div>
                    {result.duration !== null && (
                      <div className="flex-shrink-0 text-sm text-gray-500 dark:text-gray-400">
                        {formatDuration(result.duration)}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
