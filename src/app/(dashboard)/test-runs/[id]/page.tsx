'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTestRun, useCreateTestRun } from '@/hooks/use-test-runs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Play, Loader2, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate, formatDuration } from '@/lib/utils'

interface TestRunResult {
  id: string
  testCaseId: string
  status: 'passed' | 'failed' | 'skipped' | 'error'
  duration: number | null
  errorMessage: string | null
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

  const run = testRun as TestRunData | null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />
      case 'running': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case 'error': return <AlertCircle className="w-4 h-4 text-orange-500" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
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

  if (isLoading) {
    return <div className="text-center py-8">Loading...</div>
  }

  if (!run) {
    return <div className="text-center py-8">Test run not found</div>
  }

  const failedCount = run.results?.filter(r => r.status === 'failed' || r.status === 'error').length || 0

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
          <p className="text-gray-600">Created {formatDate(run.createdAt)}</p>
        </div>
        <Badge variant={run.status === 'passed' ? 'default' : run.status === 'failed' ? 'destructive' : 'secondary'}>
          {run.status}
        </Badge>
        {failedCount > 0 && (
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
            <CardTitle className="text-sm font-medium text-gray-600">Total Tests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{run.summary?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Passed</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{run.summary?.passed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Failed</CardTitle>
            <XCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{run.summary?.failed || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Duration</CardTitle>
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
              <span className="text-gray-600">Run Type:</span>
              <span className="font-medium">{run.runType}</span>
            </div>
            {run.environment && (
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="font-medium">{run.environment.name}</span>
              </div>
            )}
            {run.tags && run.tags.length > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tags:</span>
                <div className="flex gap-1">
                  {run.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            {run.startedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Started:</span>
                <span className="font-medium">{formatDate(run.startedAt)}</span>
              </div>
            )}
            {run.finishedAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Finished:</span>
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
            <div className="text-center py-8 text-gray-500">
              {run.status === 'running' ? 'Tests are running...' : 'No results available'}
            </div>
          ) : (
            <div className="space-y-3">
              {run.results.map((result: TestRunResult) => (
                <div
                  key={result.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
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
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        {result.errorMessage}
                      </div>
                    )}
                  </div>
                  {result.duration !== null && (
                    <div className="flex-shrink-0 text-sm text-gray-500">
                      {formatDuration(result.duration)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
